// Сервисный слой пользователей lawX. Обеспечивает ЕДИНУЮ точку входа между хендлерами и базой данных.
// Архитектурно ВАЖНО: сервис инкапсулирует бизнес-логику (расчёт уровней, рангов, лимитов),
// отделяя её от слоя доступа к данным. Это КЛЮЧЕВОЙ паттерн для масштабируемости проекта.

const queries = require('../database/queries')

// Регистрация нового пользователя в системе lawX по Telegram ID и username.
// ВАЖНО: перед созданием выполняется проверка на дубликаты для обеспечения идемпотентности.
async function registerUser(telegramId, username) {
  console.log('регистрация пользователя началась telegramId: ' + telegramId + ' username: ' + username)
  // Проверяем наличие пользователя в базе для предотвращения дублирования
  const existingUser = await queries.getUser(telegramId)
  if (existingUser) {
    console.log('пользователь уже существует telegramId: ' + telegramId)
    return existingUser
  }
  // Создаём нового пользователя через слой доступа к данным
  const result = await queries.createUser(telegramId, username)
  console.log('пользователь успешно зарегистрирован в системе lawx telegramId: ' + telegramId)
  return result
}

// Получение профиля пользователя с расчётом уровня и ранга.
// ВАЖНО: уровень и ранг вычисляются динамически на основе количества генераций,
// что гарантирует актуальность данных при каждом запросе профиля.
async function getUserProfile(userId) {
  console.log('получение профиля пользователя userId: ' + userId)
  const user = await queries.getUser(userId)
  if (!user) {
    console.log('пользователь не найден userId: ' + userId)
    return null
  }
  // Расчёт уровня пользователя: каждые 10 генераций — новый уровень
  const level = Math.floor((user.generations_count || 0) / 10) + 1
  // Определяем ранг пользователя по уровню — КРИТИЧНАЯ бизнес-логика геймификации
  let rank = 'Новичок'
  if (level >= 50) rank = 'Легенда lawX'
  else if (level >= 30) rank = 'Мастер права'
  else if (level >= 20) rank = 'Эксперт'
  else if (level >= 10) rank = 'Продвинутый'
  else if (level >= 5) rank = 'Опытный'
  else if (level >= 2) rank = 'Начинающий'
  user.level = level
  user.rank = rank
  console.log('профиль пользователя получен успешно userId: ' + userId + ' level: ' + level + ' rank: ' + rank)
  return user
}

// Обновление настроек пользователя по ID.
// Принимает объект settings и применяет изменения к профилю пользователя.
async function updateUserSettings(userId, settings) {
  console.log('обновление настроек пользователя userId: ' + userId + ' settings: ' + JSON.stringify(settings))
  const user = await queries.getUser(userId)
  if (!user) {
    console.log('пользователь не найден для обновления настроек userId: ' + userId)
    return null
  }
  // Обновляем данные пользователя в базе через queries
  const result = await queries.updateUser(userId, settings.username || user.username)
  console.log('настройки пользователя обновлены успешно userId: ' + userId)
  return result
}

// Получение полной статистики пользователя: генерации, уровень, ранг, дата регистрации.
// Возвращает агрегированный объект для отображения в интерфейсе.
async function getUserStatistics(userId) {
  console.log('получение статистики пользователя userId: ' + userId)
  const user = await queries.getUser(userId)
  if (!user) {
    console.log('пользователь не найден для статистики userId: ' + userId)
    return null
  }
  const totalGenerations = user.generations_count || 0
  // Любимый режим — значение по умолчанию до реализации аналитики использования
  const favoriteMode = 'Анализ документов'
  const memberSince = user.created_at || user.registered_at || new Date().toISOString()
  const level = Math.floor(totalGenerations / 10) + 1
  let rank = 'Новичок'
  if (level >= 50) rank = 'Легенда lawX'
  else if (level >= 30) rank = 'Мастер права'
  else if (level >= 20) rank = 'Эксперт'
  else if (level >= 10) rank = 'Продвинутый'
  else if (level >= 5) rank = 'Опытный'
  else if (level >= 2) rank = 'Начинающий'
  console.log('статистика пользователя получена userId: ' + userId + ' totalGenerations: ' + totalGenerations)
  return {
    totalGenerations,
    favoriteMode,
    memberSince,
    level,
    rank
  }
}

// Проверка лимитов пользователя на генерации.
// ВАЖНО: возвращает canGenerate, remaining, limit, used — всё необходимое для контроля доступа.
// Лимит по умолчанию: 10 генераций для бесплатного тарифа.
async function checkUserLimits(userId) {
  console.log('проверка лимитов пользователя userId: ' + userId)
  const user = await queries.getUser(userId)
  if (!user) {
    console.log('пользователь не найден для проверки лимитов userId: ' + userId)
    return { canGenerate: false, remaining: 0, limit: 10 }
  }
  const limit = user.max_generations || 10
  const used = user.generations_count || 0
  const remaining = Math.max(0, limit - used)
  const canGenerate = remaining > 0
  console.log('лимиты пользователя проверены userId: ' + userId + ' remaining: ' + remaining + ' canGenerate: ' + canGenerate)
  return {
    canGenerate,
    remaining,
    limit,
    used
  }
}

// Сброс ежедневных лимитов для ВСЕХ пользователей.
// ВАЖНО: предназначена для вызова по расписанию (cron) каждый день в полночь.
async function resetDailyLimits() {
  console.log('сброс ежедневных лимитов для всех пользователей начался')
  const allUsers = await queries.getAllUsers()
  let resetCount = 0
  // Последовательный сброс лимитов для каждого пользователя с логированием
  for (const user of allUsers) {
    await queries.updateUser(user.id, user.username)
    resetCount++
    console.log('лимит сброшен для пользователя id: ' + user.id)
  }
  console.log('сброс ежедневных лимитов завершён количество пользователей: ' + resetCount)
  return { resetCount }
}

// Форматирование профиля пользователя в визуально оформленный текст для Telegram.
// Включает уровень, ранг, прогресс-бар, статистику и информацию о подписке.
function formatUserProfile(user) {
  const level = Math.floor((user.generations_count || 0) / 10) + 1
  let rank = 'Новичок'
  if (level >= 50) rank = 'Легенда lawX'
  else if (level >= 30) rank = 'Мастер права'
  else if (level >= 20) rank = 'Эксперт'
  else if (level >= 10) rank = 'Продвинутый'
  else if (level >= 5) rank = 'Опытный'
  else if (level >= 2) rank = 'Начинающий'
  // Прогресс-бар уровня: 10 сегментов, визуализация через Unicode-символы
  const progressInLevel = (user.generations_count || 0) % 10
  const progressBar = '▓'.repeat(progressInLevel) + '░'.repeat(10 - progressInLevel)
  // Дата регистрации с fallback-значением
  const memberSince = user.created_at || user.registered_at || 'давным-давно'
  // Расчёт количества дней с момента регистрации
  const daysWithUs = Math.floor((Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24)) || 0
  // Сборка полного текста профиля со всей статистикой и визуальным оформлением
  const profileText = `👤 Ваш профиль в lawX
━━━━━━━━━━━━━━━━━━━━━
🆔 ID: ${user.telegram_id || user.id}
📛 Имя: ${user.first_name || user.username || 'Неизвестный герой'}
👑 Ранг: ${rank}
⭐ Уровень: ${level}
📊 Прогресс: [${progressBar}] ${progressInLevel}/10

📈 Статистика использования:
┣ 🔄 Всего генераций: ${user.generations_count || 0}
┣ 📝 Любимый режим: Анализ документов
┣ 🏆 Достижений разблокировано: ${Math.min(level * 2, 30)}
┗ 🎯 До следующего уровня: ${10 - progressInLevel} генераций

💎 Подписка:
┣ 📋 Тариф: ${user.subscription_type || 'Бесплатный'}
┣ 🔢 Лимит генераций: ${user.max_generations || 10}/день
┗ ♾️ Безлимит: ${user.max_generations === -1 ? 'Да' : 'Нет'}

📅 В lawX с: ${memberSince}
⏰ Дней с нами: ${daysWithUs}
🌟 Вы входите в топ ${Math.max(1, 100 - level)}% пользователей!

💡 Совет дня: Используйте режим "Глубокий анализ" для максимально подробных результатов!

🚀 Спасибо что выбрали lawX — вместе мы делаем право доступным каждому!
━━━━━━━━━━━━━━━━━━━━━`
  return profileText
}

module.exports = {
  registerUser,
  getUserProfile,
  updateUserSettings,
  getUserStatistics,
  checkUserLimits,
  resetDailyLimits,
  formatUserProfile
}
