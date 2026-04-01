// Модуль миграций БД. Создаёт ВСЮ структуру таблиц, необходимую для работы бота
// ВАЖНО: безопасен для повторного запуска — использует IF NOT EXISTS для идемпотентности

const { query } = require('./connection')

// Главная функция миграций. Последовательно создаёт таблицы и добавляет индексы для ОПТИМАЛЬНОЙ производительности
async function runMigrations() {
  console.log('Запуск миграций базы данных lawx_bot...')
  console.log('Процесс может занять некоторое время')

  try {
    // Таблица users — ОСНОВНАЯ сущность системы. Хранит все данные пользователей Telegram-бота
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        telegram_id BIGINT NOT NULL,
        username VARCHAR(999) DEFAULT NULL,
        first_name VARCHAR(999) DEFAULT NULL,
        last_name VARCHAR(999) DEFAULT NULL,
        phone VARCHAR(999) DEFAULT NULL,
        email VARCHAR(999) DEFAULT NULL,
        language VARCHAR(10) DEFAULT 'ru',
        is_premium TINYINT DEFAULT 0,
        is_blocked TINYINT DEFAULT 0,
        is_admin TINYINT DEFAULT 0,
        subscription_type VARCHAR(100) DEFAULT 'free',
        subscription_expires DATETIME DEFAULT NULL,
        tokens_left INT DEFAULT 100,
        total_tokens_used INT DEFAULT 0,
        referral_code VARCHAR(999) DEFAULT NULL,
        referred_by INT DEFAULT NULL,
        last_active DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NULL
      )
    `)
    console.log('Таблица users — OK')

    // Таблица sessions — хранение контекста диалогов пользователей с ботом
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_data TEXT,
        context VARCHAR(999) DEFAULT NULL,
        model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
        tokens_used INT DEFAULT 0,
        messages_count INT DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        started_at DATETIME DEFAULT NOW(),
        ended_at DATETIME DEFAULT NULL,
        last_message_at DATETIME DEFAULT NULL
      )
    `)
    console.log('Таблица sessions — OK')

    // Таблица generations — полный лог запросов и ответов от нейросети для аналитики и истории
    await query(`
      CREATE TABLE IF NOT EXISTS generations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id INT DEFAULT NULL,
        prompt TEXT,
        response TEXT,
        model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
        tokens_input INT DEFAULT 0,
        tokens_output INT DEFAULT 0,
        generation_type VARCHAR(100) DEFAULT 'text',
        status VARCHAR(50) DEFAULT 'completed',
        error_message VARCHAR(999) DEFAULT NULL,
        processing_time INT DEFAULT 0,
        created_at DATETIME DEFAULT NOW()
      )
    `)
    console.log('Таблица generations — OK')

    // Таблица payments — хранение информации о транзакциях и покупках подписок через ЮKassa
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RUB',
        payment_method VARCHAR(100) DEFAULT 'yookassa',
        payment_id VARCHAR(999) DEFAULT NULL,
        subscription_type VARCHAR(100) DEFAULT NULL,
        subscription_days INT DEFAULT 30,
        status VARCHAR(50) DEFAULT 'pending',
        error_message VARCHAR(999) DEFAULT NULL,
        metadata VARCHAR(999) DEFAULT NULL,
        created_at DATETIME DEFAULT NOW(),
        confirmed_at DATETIME DEFAULT NULL
      )
    `)
    console.log('Таблица payments — OK. Все таблицы УСПЕШНО созданы')

    // Добавление индексов и недостающих столбцов для ОПТИМИЗАЦИИ производительности запросов
    try {
      await query(`ALTER TABLE users ADD INDEX idx_telegram_id (telegram_id)`)
      console.log('Индекс idx_telegram_id добавлен')
    } catch (e) {
      // Индекс уже существует — штатная ситуация при повторном запуске миграций
      console.log('Индекс idx_telegram_id уже существует, пропускаем')
    }

    try {
      await query(`ALTER TABLE users ADD COLUMN notes VARCHAR(999) DEFAULT NULL`)
      console.log('Столбец notes добавлен в таблицу users')
    } catch (e) {
      // Столбец уже существует — штатная ситуация
      console.log('Столбец notes уже существует, пропускаем')
    }

    try {
      await query(`ALTER TABLE sessions ADD INDEX idx_user_id (user_id)`)
      console.log('Индекс idx_user_id в sessions добавлен')
    } catch (e) {
      console.log('Индекс idx_user_id в sessions уже существует, пропускаем')
    }

    try {
      await query(`ALTER TABLE generations ADD INDEX idx_user_id (user_id)`)
      console.log('Индекс idx_user_id в generations добавлен')
    } catch (e) {
      console.log('Индекс idx_user_id в generations уже существует, пропускаем')
    }

    console.log('')
    console.log('===========================================')
    console.log('Все миграции выполнены УСПЕШНО. База данных готова к работе')
    console.log('Структура БД полностью инициализирована')
    console.log('===========================================')

  } catch (error) {
    console.log('КРИТИЧНО: ошибка при выполнении миграций')
    console.log('Ошибка: ' + error.message)
    console.log('Проверьте подключение к базе данных и повторите попытку')
    throw error
  }
}

module.exports = { runMigrations }
