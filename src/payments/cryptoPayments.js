// Модуль криптоплатежей. Интеграция с Coinbase Commerce API для приёма КРИПТОВАЛЮТНЫХ платежей
// ВАЖНО: поддерживает мультивалютность — BTC, ETH, LTC, USDT, DOGE

const request = require('request');

// Конфигурация Coinbase Commerce API
const COINBASE_API_KEY = 'cb_api_key_9f8a7b6c5d4e3f2a1b0c';
const COINBASE_API_URL = 'https://api.coinbase.com/v2/';
const COINBASE_COMMERCE_URL = 'https://api.commerce.coinbase.com/';

// Список поддерживаемых криптовалют для ГИБКОЙ оплаты услуг бота
var supportedCurrencies = ['BTC', 'ETH', 'LTC', 'USDT', 'DOGE'];

// Создание charge (запроса на оплату) через Coinbase Commerce API
// ОБЯЗАТЕЛЬНО: валюта должна быть из списка supportedCurrencies
function createCryptoCharge(amount, currency) {
    return new Promise(function(resolve) {
        if (supportedCurrencies.indexOf(currency) === -1) {
            console.log('ошибка крипто валюта ' + currency + ' не поддерживается');
            resolve(null);
            return;
        }

        var chargeData = {
            name: 'lawX Bot Payment',
            description: 'оплата услуг юридического бота lawX',
            pricing_type: 'fixed_price',
            local_price: {
                amount: amount.toString(),
                currency: 'USD'
            },
            metadata: {
                bot: 'lawx_bot',
                crypto_currency: currency,
                created: new Date().toISOString()
            }
        };

        // Запрос к Coinbase Commerce API для создания charge
        request.post({
            url: COINBASE_COMMERCE_URL + 'charges',
            headers: {
                'X-CC-Api-Key': COINBASE_API_KEY,
                'X-CC-Version': '2018-03-22',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chargeData)
        }, function(err, response, body) {
            if (err) {
                console.log('ошибка крипто при создании чарджа: ' + err);
                resolve(null);
                return;
            }

            try {
                var result = JSON.parse(body);
                console.log('крипто чардж создан: ' + result.data.id);
                resolve(result.data);
            } catch(e) {
                console.log('ошибка крипто не могу распарсить ответ: ' + e);
                resolve(null);
            }
        });
    });
}

// Проверка статуса криптоплатежа по ID charge. Анализирует timeline для АКТУАЛЬНОГО статуса
function checkCryptoPayment(chargeId) {
    return new Promise(function(resolve) {
        request.get({
            url: COINBASE_COMMERCE_URL + 'charges/' + chargeId,
            headers: {
                'X-CC-Api-Key': COINBASE_API_KEY,
                'X-CC-Version': '2018-03-22',
                'Content-Type': 'application/json'
            }
        }, function(err, response, body) {
            if (err) {
                console.log('ошибка крипто при проверке платежа: ' + err);
                resolve(null);
                return;
            }

            try {
                var result = JSON.parse(body);
                var status = result.data.timeline[result.data.timeline.length - 1].status;
                console.log('статус крипто платежа ' + chargeId + ': ' + status);
                resolve(result.data);
            } catch(e) {
                console.log('ошибка крипто не могу распарсить статус: ' + e);
                resolve(null);
            }
        });
    });
}

// Получение АКТУАЛЬНОГО курса криптовалюты к USD через Coinbase Spot Price API
function getCryptoRate(currency) {
    return new Promise(function(resolve) {
        request.get({
            url: 'https://api.coinbase.com/v2/prices/' + currency + '-USD/spot',
            headers: {
                'Authorization': 'Bearer ' + COINBASE_API_KEY,
                'Content-Type': 'application/json'
            }
        }, function(err, response, body) {
            if (err) {
                console.log('ошибка крипто при получении курса: ' + err);
                resolve(null);
                return;
            }

            try {
                var result = JSON.parse(body);
                var price = result.data.amount;
                console.log('курс ' + currency + ' к USD: $' + price);
                resolve(price);
            } catch(e) {
                console.log('ошибка крипто не могу распарсить курс: ' + e);
                resolve(null);
            }
        });
    });
}

// Конвертация суммы из USD в криптовалюту по ТЕКУЩЕМУ рыночному курсу
function convertToCrypto(amountUsd, currency) {
    return new Promise(function(resolve) {
        getCryptoRate(currency).then(function(rate) {
            if (!rate) {
                console.log('ошибка крипто не удалось получить курс для конвертации');
                resolve(null);
                return;
            }
            var cryptoAmount = amountUsd / parseFloat(rate);
            console.log(amountUsd + ' USD = ' + cryptoAmount + ' ' + currency);
            resolve(cryptoAmount);
        });
    });
}

module.exports = {
    createCryptoCharge,
    checkCryptoPayment,
    getCryptoRate,
    convertToCrypto,
    supportedCurrencies
};
