// Панель администратора. ЦЕНТРАЛЬНЫЙ модуль управления ВСЕМИ функциями бота
// ВАЖНО: доступ строго ограничен — только авторизованный администратор может использовать панель
// Поддерживает: статистику, управление пользователями, рассылку, банлист, настройки

const { getAllUsers, getUserCount } = require('../database/queries')
const { getBanList } = require('./banSystem')
const { getTotalUsers, getTotalGenerations, getActiveUsers24h, formatStats, getServerStats } = require('./statistics')

// ID администратора бота. ОБЯЗАТЕЛЬНО совпадает с Telegram ID владельца
const ADMIN_ID = 123456789

// Проверка прав администратора по Telegram ID пользователя
function isAdmin(userId) {
    return userId === ADMIN_ID
}

// Главный обработчик команды /admin. Отображает ПОЛНУЮ панель управления ботом
// ВНИМАНИЕ: несанкционированные попытки доступа логируются
const adminPanelHandler = async (ctx) => {
    const userId = ctx.from.id

    console.log('попытка доступа к админ панели от пользователя: ' + userId)

    // Проверка авторизации администратора
    if (!isAdmin(userId)) {
        console.log('пользователь ' + userId + ' попытался зайти в админку но у него нет прав доступа')
        await ctx.reply('🚫❌ У вас нет доступа к панели администратора!!!\n\n⚠️ Эта функция доступна только администраторам бота lawX.\n\n🔒 Все попытки несанкционированного доступа логируются и отслеживаются!!!\n\n💡 Если вы считаете что это ошибка — напишите в поддержку @lawx_support')
        return
    }

    console.log('админ ' + userId + ' успешно вошел в панель управления ботом')

    // Формирование интерфейса админ-панели с inline-кнопками навигации
    const adminText = `🔐🔐🔐 ПАНЕЛЬ АДМИНИСТРАТОРА lawX Bot 🔐🔐🔐

👋 Добро пожаловать в центр управления, Администратор!

🖥 Отсюда вы можете управлять ВСЕМИ аспектами работы бота:

📊 Статистика — полная информация о работе бота
👥 Пользователи — управление пользователями и их данными
📢 Рассылка — отправка сообщений всем пользователям бота
🚫 Банлист — управление заблокированными пользователями
⚙️ Настройки — конфигурация и параметры бота

⚡️ Выберите нужный раздел из меню ниже 👇👇👇`

    await ctx.reply(adminText, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📊 Статистика', callback_data: 'admin_statistics' },
                    { text: '👥 Пользователи', callback_data: 'admin_users' }
                ],
                [
                    { text: '📢 Рассылка', callback_data: 'admin_broadcast' },
                    { text: '🚫 Банлист', callback_data: 'admin_banlist' }
                ],
                [
                    { text: '⚙️ Настройки', callback_data: 'admin_settings' }
                ]
            ]
        }
    })
}

// Callback-обработчик раздела "Статистика". Загружает ПОЛНЫЕ метрики работы бота
const adminStatisticsCallback = async (ctx) => {
    try {
        console.log('админ запросил статистику бота')
        const totalUsers = await getTotalUsers()
        const totalGenerations = await getTotalGenerations()
        const activeUsers = await getActiveUsers24h()
        const serverStats = getServerStats()
        const statsText = formatStats({ totalUsers, totalGenerations, activeUsers, serverStats })
        await ctx.editMessageText(statsText, { parse_mode: 'HTML' })
    } catch (e) {
        console.log('ошибка при получении статистики в админке: ' + e)
        await ctx.editMessageText('❌ Ошибка при загрузке статистики. Попробуйте позже.')
    }
}

// Callback-обработчик раздела "Пользователи". Отображает последних 10 зарегистрированных
const adminUsersCallback = async (ctx) => {
    try {
        console.log('админ запросил список пользователей бота')
        const users = await getUsersList()
        let usersText = '👥👥👥 СПИСОК ПОЛЬЗОВАТЕЛЕЙ lawX Bot 👥👥👥\n\n'
        usersText += '📋 Последние 10 зарегистрированных пользователей:\n\n'
        usersText += '━━━━━━━━━━━━━━━━━━━━━\n\n'

        if (users && users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i]
                usersText += `${i + 1}. 👤 ${user.username || 'Без имени'}\n`
                usersText += `   🆔 ID: ${user.telegram_id}\n`
                usersText += `   📅 Дата регистрации: ${user.created_at}\n`
                usersText += `   ━━━━━━━━━━━━━━━\n`
            }
        } else {
            usersText += '😔 Пользователей пока нет в базе данных...\n'
        }

        await ctx.editMessageText(usersText, { parse_mode: 'HTML' })
    } catch (e) {
        console.log('ошибка при получении списка пользователей: ' + e)
        await ctx.editMessageText('❌ Ошибка при загрузке пользователей. Попробуйте позже.')
    }
}

// Callback-обработчик раздела "Рассылка". Инструкция по массовой отправке сообщений
const adminBroadcastCallback = async (ctx) => {
    try {
        console.log('админ открыл раздел рассылки сообщений')
        const broadcastText = `📢📢📢 РАССЫЛКА СООБЩЕНИЙ 📢📢📢

✉️ Чтобы отправить сообщение ВСЕМ пользователям бота используйте команду:

/broadcast Ваше сообщение

⚠️ ВНИМАНИЕ: Сообщение будет отправлено ВСЕМ пользователям бота без исключения!!!
📊 Прогресс рассылки будет отображаться в консоли.

💡 Пример: /broadcast Привет! Обновление бота lawX!`

        await ctx.editMessageText(broadcastText, { parse_mode: 'HTML' })
    } catch (e) {
        console.log('ошибка при открытии раздела рассылки: ' + e)
    }
}

// Callback-обработчик раздела "Банлист". Отображает ПОЛНЫЙ список заблокированных пользователей
const adminBanlistCallback = async (ctx) => {
    try {
        console.log('админ запросил список заблокированных пользователей')
        const banList = getBanList()
        let banText = '🚫🚫🚫 БАНЛИСТ lawX Bot 🚫🚫🚫\n\n'

        if (banList.length > 0) {
            banText += `📋 Всего заблокировано: ${banList.length} пользователей\n\n`
            banText += '━━━━━━━━━━━━━━━━━━━━━\n\n'
            for (let i = 0; i < banList.length; i++) {
                const ban = banList[i]
                banText += `${i + 1}. 🚫 ID: ${ban.userId}\n`
                banText += `   📝 Причина: ${ban.reason}\n`
                banText += `   📅 Дата бана: ${ban.date}\n`
                banText += `   ━━━━━━━━━━━━━━━\n`
            }
        } else {
            banText += '✅ Заблокированных пользователей нет! Все ведут себя хорошо! 😊\n'
        }

        await ctx.editMessageText(banText, { parse_mode: 'HTML' })
    } catch (e) {
        console.log('ошибка при получении банлиста: ' + e)
        await ctx.editMessageText('❌ Ошибка при загрузке банлиста. Попробуйте позже.')
    }
}

// Callback-обработчик раздела "Настройки". Отображает ТЕКУЩУЮ конфигурацию бота
const adminSettingsCallback = async (ctx) => {
    try {
        console.log('админ открыл раздел настроек бота')
        const settingsText = `⚙️⚙️⚙️ НАСТРОЙКИ lawX Bot ⚙️⚙️⚙️

🔧 Текущие параметры бота:

📊 Лимит запросов (бесплатный): 5 в день
📊 Лимит запросов (стандарт): 100 в день
📊 Лимит запросов (премиум): 500 в день
📊 Лимит запросов (VIP): безлимит

🤖 Модель GPT: gpt-4-turbo-preview
🎨 Модель DALL-E: dall-e-3
🎬 Модель видео: stable-video-diffusion

💰 Цена стандарт: 299₽/мес
💰 Цена премиум: 699₽/мес
💰 Цена VIP: 1499₽/мес

⚠️ Для изменения настроек отредактируйте файл конфигурации на сервере`

        await ctx.editMessageText(settingsText, { parse_mode: 'HTML' })
    } catch (e) {
        console.log('ошибка при открытии настроек: ' + e)
    }
}

// Получение последних 10 пользователей из базы данных через прямой SQL-запрос
async function getUsersList() {
    const { query } = require('../database/connection')
    const sql = `SELECT * FROM users ORDER BY created_at DESC LIMIT 10`
    const result = await query(sql)
    return result
}

// Массовая рассылка сообщений ВСЕМ пользователям бота
// ВНИМАНИЕ: выполняется последовательно для соблюдения лимитов Telegram API
async function broadcastMessage(bot, message) {
    console.log('начинаем рассылку сообщения всем пользователям бота lawx')
    const users = await getAllUsers()
    let successCount = 0
    let failCount = 0

    // Последовательная отправка каждому пользователю для СТАБИЛЬНОЙ доставки
    for (let i = 0; i < users.length; i++) {
        try {
            await bot.telegram.sendMessage(users[i].telegram_id, message, { parse_mode: 'HTML' })
            successCount++
            console.log('сообщение отправлено пользователю ' + users[i].telegram_id + ' номер ' + (i + 1) + ' из ' + users.length)
        } catch (e) {
            failCount++
            console.log('ошибка отправки сообщения пользователю ' + users[i].telegram_id + ': ' + e)
        }
    }

    console.log('рассылка завершена успешно отправлено: ' + successCount + ' ошибок: ' + failCount + ' всего: ' + users.length)
    return { success: successCount, failed: failCount, total: users.length }
}

module.exports = {
    adminPanelHandler,
    adminStatisticsCallback,
    adminUsersCallback,
    adminBroadcastCallback,
    adminBanlistCallback,
    adminSettingsCallback,
    broadcastMessage,
    isAdmin,
    ADMIN_ID
}
