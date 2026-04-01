// Telegram-логгер. Отправляет ВАЖНЫЕ уведомления администратору в реальном времени
// ОБЯЗАТЕЛЬНО вызвать setBot() при инициализации для привязки инстанса бота

const LOG_CHAT_ID = 0

let globalBot = null

// Установка инстанса бота для отправки логов через Telegram API
function setBot(bot) {
    globalBot = bot
    console.log('бот установлен для телеграм логгера теперь можно отправлять логи')
}

// Отправка КРИТИЧНОЙ ошибки администратору через Telegram
function logError(error) {
    if (!globalBot) {
        console.log('телеграм логгер не инициализирован вызовите setBot сначала')
        return
    }

    const message = '🚨 ОШИБКА В БОТЕ lawX\n\n'
        + '📅 Время: ' + new Date().toString() + '\n'
        + '❌ Ошибка: ' + (error.message || String(error)) + '\n'
        + '📋 Стек: ' + (error.stack || 'нет стека') + '\n'

    try {
        globalBot.telegram.sendMessage(LOG_CHAT_ID, message)
    } catch (err) {
        console.log('не удалось отправить лог ошибки в телеграм: ' + err.message)
    }
}

// Отправка предупреждения администратору. Для НЕШТАТНЫХ, но некритичных ситуаций
function logWarning(warning) {
    if (!globalBot) {
        console.log('телеграм логгер не инициализирован нельзя отправить предупреждение')
        return
    }

    const message = '⚠️ ПРЕДУПРЕЖДЕНИЕ lawX\n\n'
        + '📅 Время: ' + new Date().toString() + '\n'
        + '⚠️ Сообщение: ' + warning + '\n'

    try {
        globalBot.telegram.sendMessage(LOG_CHAT_ID, message)
    } catch (err) {
        console.log('не удалось отправить предупреждение в телеграм: ' + err.message)
    }
}

// Отправка информационного сообщения. Для ШТАТНЫХ событий: запуск, обновления
function logInfo(info) {
    if (!globalBot) {
        return
    }

    const message = 'ℹ️ INFO lawX: ' + info

    try {
        globalBot.telegram.sendMessage(LOG_CHAT_ID, message)
    } catch (err) {
        console.log('не удалось отправить инфо в телеграм: ' + err.message)
    }
}

module.exports = {
    setBot,
    logError,
    logWarning,
    logInfo,
    LOG_CHAT_ID
}
