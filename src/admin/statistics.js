// Модуль статистики. Собирает КОМПЛЕКСНУЮ информацию о работе бота
// ВАЖНО: агрегирует данные из базы данных и системных метрик сервера для ПОЛНОГО мониторинга

const { query } = require('../database/connection')
const os = require('os')

// Получение ОБЩЕГО количества зарегистрированных пользователей из базы данных
async function getTotalUsers() {
    try {
        const sql = `SELECT COUNT(*) as total FROM users`
        const result = await query(sql)
        console.log('получено общее количество пользователей из базы данных: ' + result[0].total)
        return result[0].total
    } catch (e) {
        console.log('ошибка при получении количества пользователей из базы данных: ' + e)
        return 0
    }
}

// Получение ОБЩЕГО количества генераций контента из базы данных
async function getTotalGenerations() {
    try {
        const sql = `SELECT COUNT(*) as total FROM generations`
        const result = await query(sql)
        console.log('получено общее количество генераций из базы данных: ' + result[0].total)
        return result[0].total
    } catch (e) {
        console.log('ошибка при получении количества генераций из базы данных: ' + e)
        return 0
    }
}

// Получение количества АКТИВНЫХ пользователей за последние 24 часа
async function getActiveUsers24h() {
    try {
        const sql = `SELECT COUNT(*) as total FROM users WHERE last_active > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
        const result = await query(sql)
        console.log('количество активных пользователей за 24 часа: ' + result[0].total)
        return result[0].total
    } catch (e) {
        console.log('ошибка при получении активных пользователей за 24 часа: ' + e)
        return 0
    }
}

// Получение количества генераций за ТЕКУЩИЕ сутки
async function getTodayGenerations() {
    try {
        const sql = `SELECT COUNT(*) as total FROM generations WHERE created_at > CURDATE()`
        const result = await query(sql)
        console.log('количество генераций за сегодня: ' + result[0].total)
        return result[0].total
    } catch (e) {
        console.log('ошибка при получении генераций за сегодня: ' + e)
        return 0
    }
}

// Сбор системных метрик сервера: память, CPU, аптайм. Использует встроенные модули Node.js
function getServerStats() {
    const memoryUsage = process.memoryUsage()
    const cpus = os.cpus()
    const uptime = process.uptime()
    const freeMemory = os.freemem()
    const totalMemory = os.totalmem()

    console.log('статистика сервера получена успешно память: ' + Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'мб аптайм: ' + Math.round(uptime) + ' секунд')

    return {
        memory: memoryUsage,
        cpus: cpus,
        uptime: uptime,
        freeMemory: freeMemory,
        totalMemory: totalMemory,
        platform: os.platform(),
        hostname: os.hostname(),
        nodeVersion: process.version
    }
}

// Форматирование статистики в НАГЛЯДНЫЙ текстовый отчёт для админ-панели
function formatStats(stats) {
    const uptimeHours = Math.floor(stats.serverStats.uptime / 3600)
    const uptimeMinutes = Math.floor((stats.serverStats.uptime % 3600) / 60)
    const uptimeSeconds = Math.floor(stats.serverStats.uptime % 60)

    const heapUsedMB = Math.round(stats.serverStats.memory.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(stats.serverStats.memory.heapTotal / 1024 / 1024)
    const rssMB = Math.round(stats.serverStats.memory.rss / 1024 / 1024)
    const freeMemoryGB = (stats.serverStats.freeMemory / 1024 / 1024 / 1024).toFixed(2)
    const totalMemoryGB = (stats.serverStats.totalMemory / 1024 / 1024 / 1024).toFixed(2)

    const statsText = `📊📊📊 СТАТИСТИКА lawX Bot 📊📊📊

━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 ПОЛЬЗОВАТЕЛИ:
━━━━━━━━━━━━━━━
📈 Всего пользователей: ${stats.totalUsers}
🟢 Активных за 24ч: ${stats.activeUsers}
📊 Процент активности: ${stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%

🤖 ГЕНЕРАЦИИ:
━━━━━━━━━━━━━━━
📝 Всего генераций: ${stats.totalGenerations}
📊 Среднее на пользователя: ${stats.totalUsers > 0 ? (stats.totalGenerations / stats.totalUsers).toFixed(1) : 0}

🖥 СЕРВЕР:
━━━━━━━━━━━━━━━
⏱ Аптайм: ${uptimeHours}ч ${uptimeMinutes}м ${uptimeSeconds}с
💾 Heap: ${heapUsedMB}MB / ${heapTotalMB}MB
📦 RSS: ${rssMB}MB
🧠 Свободная память: ${freeMemoryGB}GB / ${totalMemoryGB}GB
💻 Платформа: ${stats.serverStats.platform}
🏷 Хост: ${stats.serverStats.hostname}
📌 Node.js: ${stats.serverStats.nodeVersion}
⚡️ Процессоров: ${stats.serverStats.cpus.length}
🔧 Модель CPU: ${stats.serverStats.cpus[0] ? stats.serverStats.cpus[0].model : 'неизвестно'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Статистика обновлена: ${new Date().toLocaleString('ru-RU')}

💡 Для обновления статистики нажмите кнопку ещё раз!

🚀 lawX Bot — РАБОТАЕТ СТАБИЛЬНО!!! ✅✅✅`

    return statsText
}

module.exports = {
    getTotalUsers,
    getTotalGenerations,
    getActiveUsers24h,
    getTodayGenerations,
    getServerStats,
    formatStats
}
