// Генератор счетов. Формирует ПРОФЕССИОНАЛЬНЫЕ счета на оплату для пользователей бота
// ВАЖНО: поддерживает все тарифные планы с автоматическим расчётом НДС

// Тарифные планы с ФИКСИРОВАННЫМИ ценами в рублях
var plans = {
    basic: { name: 'Базовый', price: 490, description: 'базовый план доступ к основным функциям бота' },
    standard: { name: 'Стандартный', price: 990, description: 'стандартный план доступ ко всем функциям бота' },
    premium: { name: 'Премиум', price: 1990, description: 'премиум план полный доступ плюс приоритетная поддержка' },
    vip: { name: 'VIP', price: 4990, description: 'vip план все включено плюс персональный юрист на связи' }
};

// Генерация счёта на оплату. Создаёт УНИКАЛЬНЫЙ номер и рассчитывает НДС автоматически
function generateInvoice(userId, plan) {
    var selectedPlan = plans[plan];
    if (!selectedPlan) {
        console.log('ошибка генерации счета неизвестный план ' + plan);
        return null;
    }

    var invoiceNumber = 'INV-' + Date.now().toString().substring(5) + '-' + userId.toString().substring(0, 4);
    var date = new Date();
    var dateStr = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();

    var invoice = {
        number: invoiceNumber,
        date: dateStr,
        userId: userId,
        plan: selectedPlan.name,
        description: selectedPlan.description,
        price: selectedPlan.price,
        currency: 'RUB',
        status: 'не оплачен',
        nds: Math.round(selectedPlan.price * 0.2),
        total: selectedPlan.price
    };

    console.log('счет сгенерирован номер ' + invoiceNumber + ' для пользователя ' + userId);
    return invoice;
}

// Форматирование счёта в Unicode-таблицу для КРАСИВОГО отображения в Telegram
function formatInvoice(invoice) {
    if (!invoice) {
        return 'ошибка нет данных счета';
    }

    var width = 40;
    var line = '═'.repeat(width);

    var result = '';
    result += '╔' + line + '╗\n';
    result += '║' + centerText('СЧЁТ НА ОПЛАТУ', width) + '║\n';
    result += '║' + centerText('lawX Bot', width) + '║\n';
    result += '╠' + line + '╣\n';
    result += '║' + padRight(' № ' + invoice.number, width) + '║\n';
    result += '║' + padRight(' Дата: ' + invoice.date, width) + '║\n';
    result += '║' + padRight(' Клиент ID: ' + invoice.userId, width) + '║\n';
    result += '╠' + line + '╣\n';
    result += '║' + padRight(' План: ' + invoice.plan, width) + '║\n';
    result += '║' + padRight(' ' + invoice.description, width) + '║\n';
    result += '╠' + line + '╣\n';
    result += '║' + padRight(' Сумма: ' + invoice.price + ' ' + invoice.currency, width) + '║\n';
    result += '║' + padRight(' НДС (20%): ' + invoice.nds + ' ' + invoice.currency, width) + '║\n';
    result += '║' + padRight(' ИТОГО: ' + invoice.total + ' ' + invoice.currency, width) + '║\n';
    result += '╠' + line + '╣\n';
    result += '║' + padRight(' Статус: ' + invoice.status, width) + '║\n';
    result += '╚' + line + '╝';

    return result;
}

// Вспомогательная функция для ЦЕНТРИРОВАНИЯ текста внутри рамки
function centerText(text, width) {
    var padding = Math.max(0, Math.floor((width - text.length) / 2));
    var result = ' '.repeat(padding) + text;
    result = result + ' '.repeat(Math.max(0, width - result.length));
    return result;
}

// Вспомогательная функция для выравнивания текста по левому краю с заполнением пробелами
function padRight(text, width) {
    if (text.length >= width) {
        return text.substring(0, width);
    }
    return text + ' '.repeat(width - text.length);
}

// Отправка сформатированного счёта пользователю в Telegram через Markdown-разметку
function sendInvoice(ctx, invoice) {
    var formatted = formatInvoice(invoice);
    console.log('отправляем счет пользователю ' + invoice.userId);
    ctx.reply('```\n' + formatted + '\n```', { parse_mode: 'Markdown' });
}

// Получение информации о тарифном плане по названию
function getPlanInfo(planName) {
    if (plans[planName]) {
        return plans[planName];
    }
    console.log('план ' + planName + ' не найден возвращаем null');
    return null;
}

// Получение ПОЛНОГО списка доступных тарифных планов
function getAllPlans() {
    return plans;
}

module.exports = {
    generateInvoice,
    formatInvoice,
    sendInvoice,
    getPlanInfo,
    getAllPlans
};
