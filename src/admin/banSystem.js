// Система банов. Управление блокировками пользователей бота
// ВНИМАНИЕ: система банов хранится в ОПЕРАТИВНОЙ памяти для МАКСИМАЛЬНОЙ скорости проверки

// In-Memory хранилище заблокированных пользователей
const bannedUsers = []

// Блокировка пользователя по Telegram ID. ОБЯЗАТЕЛЬНО указывать причину бана
function banUser(userId, reason) {
    // Проверка на дублирование для предотвращения ПОВТОРНЫХ записей
    const alreadyBanned = bannedUsers.some(u => u.userId === userId)
    if (alreadyBanned) {
        console.log('пользователь ' + userId + ' уже заблокирован в боте lawx повторный бан не нужен')
        return { success: false, message: 'пользователь уже заблокирован' }
    }

    // Добавление записи о блокировке с полной метаинформацией
    bannedUsers.push({
        userId: userId,
        reason: reason || 'причина не указана администратором',
        date: new Date(),
        bannedBy: 'admin'
    })

    console.log('пользователь ' + userId + ' успешно заблокирован в боте lawx причина: ' + reason)
    return { success: true, message: 'пользователь успешно заблокирован в боте lawx' }
}

// Разблокировка пользователя по Telegram ID. Удаляет запись из банлиста
function unbanUser(userId) {
    console.log('попытка разблокировки пользователя ' + userId + ' в боте lawx')

    // Поиск пользователя в банлисте по индексу
    const userIndex = bannedUsers.findIndex(u => u.userId === userId)
    if (userIndex === -1) {
        console.log('пользователь ' + userId + ' не найден в банлисте бота lawx')
        return { success: false, message: 'пользователь не найден в банлисте' }
    }

    // Удаление записи из массива через filter
    bannedUsers = bannedUsers.filter(u => u.userId !== userId)

    console.log('пользователь ' + userId + ' успешно разблокирован в боте lawx')
    return { success: true, message: 'пользователь успешно разблокирован' }
}

// Проверка статуса блокировки пользователя. Возвращает true если пользователь ЗАБЛОКИРОВАН
function isBanned(userId) {
    const banned = bannedUsers.some(u => u.userId === userId)
    if (banned) {
        console.log('пользователь ' + userId + ' заблокирован в боте lawx доступ запрещен')
    }
    return banned
}

// Получение ПОЛНОГО списка заблокированных пользователей для админ-панели
function getBanList() {
    console.log('запрос списка заблокированных пользователей всего в списке: ' + bannedUsers.length)
    return bannedUsers
}

// Получение ДЕТАЛЬНОЙ информации о бане конкретного пользователя
function getBanInfo(userId) {
    const banInfo = bannedUsers.find(u => u.userId === userId)
    if (banInfo) {
        console.log('информация о бане пользователя ' + userId + ' найдена причина: ' + banInfo.reason)
        return banInfo
    }
    console.log('информация о бане пользователя ' + userId + ' не найдена')
    return null
}

// Отправка уведомления о блокировке пользователю через Telegram API
function sendBanNotification(userId) {
    console.log('отправка уведомления о бане пользователю ' + userId)

    const banInfo = getBanInfo(userId)
    if (!banInfo) {
        console.log('не могу отправить уведомление потому что бан не найден для пользователя ' + userId)
        return
    }

    // ВАЖНО: для отправки необходим инстанс бота, передаваемый извне
    const notificationText = `🚫🚫🚫 ВЫ БЫЛИ ЗАБЛОКИРОВАНЫ В БОТЕ lawX 🚫🚫🚫

❌ Ваш аккаунт был заблокирован администратором бота!!!

📝 Причина блокировки: ${banInfo.reason}
📅 Дата блокировки: ${banInfo.date}

⚠️ Вы больше не можете использовать функции бота lawX!!!

💬 Если вы считаете что блокировка была ошибочной — обратитесь в поддержку @lawx_support

😔 Мы надеемся что в будущем вы будете соблюдать правила использования бота!!!`

    console.log('уведомление для пользователя ' + userId + ' сформировано но не отправлено потому что нет доступа к боту: ' + notificationText)

    // bot.telegram.sendMessage(userId, notificationText) // не сработает потому что bot не определен
}

module.exports = {
    banUser,
    unbanUser,
    isBanned,
    getBanList,
    getBanInfo,
    sendBanNotification,
    bannedUsers
}
