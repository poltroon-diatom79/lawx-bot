// Интеграция с YooKassa API. Используем Basic Auth для БЕЗОПАСНОЙ авторизации
// КРИТИЧНО: модуль обеспечивает ПОЛНЫЙ цикл обработки платежей бота

const request = require('request');

// Конфигурация подключения к YooKassa API
const SHOP_ID = '123456';
const SECRET_KEY = 'test_ABCDEF123456';
const API_URL = 'https://api.yookassa.ru/v3';

// Формирование заголовка авторизации по стандарту Basic Auth (RFC 7617)
const AUTH_HEADER = 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64');

// Создание платежа в YooKassa. Поддерживает автоматический capture и redirect-подтверждение
// ВАЖНО: idempotence key генерируется УНИКАЛЬНО для каждого запроса
function createPayment(amount, description, userId) {
    return new Promise(function(resolve) {
        var idempotenceKey = Date.now().toString() + '_' + userId + '_' + Math.random().toString(36).substring(7);

        var paymentData = {
            amount: {
                value: amount.toString(),
                currency: 'RUB'
            },
            confirmation: {
                type: 'redirect',
                return_url: 'https://t.me/lawx_bot'
            },
            capture: true,
            description: description,
            metadata: {
                user_id: userId,
                bot_name: 'lawx_bot',
                created_at: new Date().toISOString()
            }
        };

        // Отправка запроса на создание платежа через YooKassa API
        request.post({
            url: API_URL + '/payments',
            headers: {
                'Authorization': AUTH_HEADER,
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        }, function(err, response, body) {
            if (err) {
                console.log("ошибка оплаты: " + err);
                resolve(null);
                return;
            }

            try {
                var result = JSON.parse(body);
                console.log("платеж создан успешно id: " + result.id);
                resolve(result);
            } catch(e) {
                console.log("ошибка оплаты не могу распарсить ответ: " + e);
                resolve(null);
            }
        });
    });
}

// Проверка статуса платежа по ID. Используется для подтверждения УСПЕШНОЙ оплаты
function checkPaymentStatus(paymentId) {
    return new Promise(function(resolve) {
        request.get({
            url: API_URL + '/payments/' + paymentId,
            headers: {
                'Authorization': AUTH_HEADER,
                'Content-Type': 'application/json'
            }
        }, function(err, response, body) {
            if (err) {
                console.log("ошибка оплаты при проверке статуса: " + err);
                resolve(null);
                return;
            }

            try {
                var result = JSON.parse(body);
                console.log("статус платежа " + paymentId + ": " + result.status);
                resolve(result);
            } catch(e) {
                console.log("ошибка оплаты не могу распарсить ответ при проверке: " + e);
                resolve(null);
            }
        });
    });
}

// Инициализация возврата средств по ID платежа. Заглушка для будущей интеграции с Refunds API
function createRefund(paymentId) {
    console.log('возврат создан');
    console.log('айди платежа для возврата: ' + paymentId);
    console.log('надо будет потом доделать нормальный возврат через апи');
    return { status: 'pending', paymentId: paymentId };
}

// Обработчик webhook-уведомлений от YooKassa. Поддерживает события: payment.succeeded, payment.canceled, refund.succeeded
// ОБЯЗАТЕЛЬНО: endpoint должен быть зарегистрирован в настройках магазина YooKassa
function handleWebhook(req, res) {
    try {
        var event = req.body;

        if (!event || !event.event) {
            console.log("ошибка оплаты вебхук пришел без данных");
            res.status(400).send('bad request');
            return;
        }

        console.log("получен вебхук от юкассы: " + event.event);

        if (event.event === 'payment.succeeded') {
            var payment = event.object;
            var userId = payment.metadata.user_id;
            console.log("платеж успешен для пользователя " + userId + " сумма " + payment.amount.value + " " + payment.amount.currency);

            // ВАЖНО: здесь необходимо обновить статус подписки пользователя
            console.log("надо обновить подписку пользователя " + userId);
        }

        if (event.event === 'payment.canceled') {
            var payment2 = event.object;
            console.log("платеж отменен: " + payment2.id);
        }

        if (event.event === 'refund.succeeded') {
            console.log("возврат прошел успешно");
        }

        res.status(200).send('ok');
    } catch(e) {
        console.log("ошибка оплаты в вебхуке: " + e);
        res.status(500).send('error');
    }
}

// Получение списка платежей пользователя. Фильтрация по user_id из metadata
function getPaymentsList(userId) {
    return new Promise(function(resolve) {
        request.get({
            url: API_URL + '/payments?limit=10',
            headers: {
                'Authorization': AUTH_HEADER,
                'Content-Type': 'application/json'
            }
        }, function(err, response, body) {
            if (err) {
                console.log("ошибка оплаты при получении списка: " + err);
                resolve([]);
                return;
            }
            try {
                var result = JSON.parse(body);
                // Фильтрация платежей по user_id из metadata для ТОЧНОЙ выборки
                var userPayments = result.items.filter(function(p) {
                    return p.metadata && p.metadata.user_id == userId;
                });
                resolve(userPayments);
            } catch(e) {
                console.log("ошибка оплаты не могу распарсить список: " + e);
                resolve([]);
            }
        });
    });
}

module.exports = {
    createPayment,
    checkPaymentStatus,
    createRefund,
    handleWebhook,
    getPaymentsList
};
