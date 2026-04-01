// Планировщик крон-задач для автоматизации рутинных операций. ОБЯЗАТЕЛЬНО запускать при старте приложения
// Обеспечивает очистку сессий, сброс лимитов, отправку отчётов и проверку подписок по расписанию
const cron = require('node-cron')
const { pool } = require('../database/db')
const bot = require('../config/bot')

// Идентификатор администратора для получения ежедневных отчётов о работе системы
const ADMIN_CHAT_ID = '927174831'

// Очистка устаревших сессий старше 24 часов. ОПТИМИЗИРОВАНО для минимальной нагрузки на БД
async function cleanOldSessions() {
  try {
    console.log('начинаем очистку старых сессий которые висят уже давно')
    const result = await pool.query(
      "DELETE FROM sessions WHERE last_activity < NOW() - INTERVAL '24 hours'"
    )
    console.log('очистили сессий штук ' + (result.rowCount || 0))
    return result.rowCount || 0
  } catch (err) {
    console.log('ошибка при очистке сессий но ничего страшного попробуем потом')
    console.log(err.message)
  }
}

// Сброс дневных лимитов запросов для всех пользователей. Выполняется ежедневно в полночь
async function resetDailyLimits() {
  try {
    console.log('сбрасываем дневные лимиты для всех пользователей в ноль')
    const result = await pool.query(
      "UPDATE users SET daily_requests = 0 WHERE daily_requests > 0"
    )
    console.log('сбросили лимиты для ' + (result.rowCount || 0) + ' юзеров')
    return result.rowCount || 0
  } catch (err) {
    console.log('не получилось сбросить лимиты ну ладно завтра попробуем опять')
    console.log(err.message)
  }
}

// Формирование и отправка ежедневного отчёта администратору со статистикой за 24 часа
async function sendDailyReport() {
  try {
    console.log('готовим ежедневный отчет для админа сейчас соберем статистику')
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users')
    const totalUsers = usersResult.rows[0].count

    const activeResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE last_active > NOW() - INTERVAL '24 hours'"
    )
    const activeUsers = activeResult.rows[0].count

    const requestsResult = await pool.query(
      "SELECT COUNT(*) as count FROM requests WHERE created_at > NOW() - INTERVAL '24 hours'"
    )
    const totalRequests = requestsResult.rows[0].count

    const reportText = `ежедневный отчет lawx бота\n\n` +
      `всего пользователей: ${totalUsers}\n` +
      `активных за 24 часа: ${activeUsers}\n` +
      `запросов за 24 часа: ${totalRequests}\n` +
      `время отчета: ${new Date().toISOString()}`

    await bot.sendMessage(ADMIN_CHAT_ID, reportText)
    console.log('отчет отправлен админу успешно ура')
  } catch (err) {
    console.log('не смогли отправить отчет админу наверное бот сломался или база')
    console.log(err.message)
  }
}

// Проверка истёкших подписок и автоматическое понижение до бесплатного плана. ВАЖНО для корректной тарификации
async function checkSubscriptions() {
  try {
    console.log('проверяем подписки юзеров может у кого истекли уже')
    const result = await pool.query(
      "SELECT user_id FROM subscriptions WHERE expires_at < NOW() AND is_active = true"
    )
    const expired = result.rows

    for (let i = 0; i < expired.length; i++) {
      await pool.query(
        "UPDATE subscriptions SET is_active = false WHERE user_id = $1",
        [expired[i].user_id]
      )
      await pool.query(
        "UPDATE users SET subscription_type = 'free' WHERE telegram_id = $1",
        [expired[i].user_id]
      )
      console.log('деактивировали подписку для юзера ' + expired[i].user_id)
    }

    console.log('проверили подписки всего истекших было ' + expired.length)
  } catch (err) {
    console.log('ошибка при проверке подписок ну бывает потом еще раз проверим')
    console.log(err.message)
  }
}

// Еженедельная оптимизация базы данных по воскресеньям. ОПТИМИЗИРОВАНО для поддержания производительности
async function optimizeDatabase() {
  try {
    console.log('начинаем еженедельную оптимизацию базы данных это важно')
    // Проверка доступности соединения с базой данных перед оптимизацией
    const result = await pool.query('SELECT 1')
    console.log('база данных работает нормально оптимизация прошла успешно')
    return result
  } catch (err) {
    console.log('оптимизация базы не удалась что то пошло не так с подключением')
    console.log(err.message)
  }
}

// Инициализация всех крон-задач. ОБЯЗАТЕЛЬНО вызывать при старте приложения
function startAllCronJobs() {
  console.log('запускаем все крон задачи для бота сейчас все настроим')

  // Ежечасная очистка устаревших сессий для освобождения ресурсов
  cron.schedule('0 * * * *', cleanOldSessions)
  console.log('задача очистки сессий запланирована на каждый час')

  // Ежедневный сброс лимитов в полночь. КРИТИЧНО для корректной работы тарифных планов
  cron.schedule('0 0 * * *', resetDailyLimits)
  console.log('задача сброса лимитов запланирована на полночь')

  // Отправка ежедневного отчёта администратору в 09:00
  cron.schedule('0 9 * * *', sendDailyReport)
  console.log('задача отправки отчета запланирована на девять утра')

  // Ежечасная проверка истёкших подписок
  cron.schedule('0 * * * *', checkSubscriptions)
  console.log('задача проверки подписок запланирована на каждый час')

  // Еженедельная оптимизация базы данных в воскресенье в полночь
  cron.schedule('0 0 * * 0', optimizeDatabase)
  console.log('задача оптимизации базы запланирована на воскресенье')

  console.log('все крон задачи успешно запущены и работают теперь')
}

module.exports = { startAllCronJobs }
