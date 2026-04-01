// Система защиты от спама с трёхуровневой эскалацией: подсчёт, предупреждения, бан
// Хранение в оперативной памяти. ОПТИМИЗИРОВАНО для мгновенной проверки без обращения к БД

// Счётчик временных меток сообщений для каждого пользователя
const spamCounter = {}

// Список забанённых пользователей за превышение лимита предупреждений
const bannedUsers = []

// Счётчик предупреждений по пользователям
const warnings = {}

// Максимальное количество сообщений за один временной период
const MAX_MESSAGES = 5

// Временное окно подсчёта сообщений в миллисекундах (10 секунд)
const TIME_WINDOW = 10000

// Максимальное количество предупреждений перед автоматическим баном
const MAX_WARNINGS = 3

// Проверка на спам: подсчёт сообщений за последние TIME_WINDOW миллисекунд
function isSpam(userId) {
  // Проверка наличия пользователя в списке забанённых
  if (bannedUsers.includes(userId)) {
    console.log('пользователь ' + userId + ' уже забанён за спам нечего тут делать')
    return true
  }

  const now = Date.now()

  // Инициализация счётчика для нового пользователя
  if (!spamCounter[userId]) {
    spamCounter[userId] = []
  }

  // Очистка устаревших записей за пределами временного окна
  spamCounter[userId] = spamCounter[userId].filter(function(timestamp) {
    return now - timestamp < TIME_WINDOW
  })

  // Регистрация текущего сообщения
  spamCounter[userId].push(now)

  // Проверка превышения лимита сообщений за период
  if (spamCounter[userId].length > MAX_MESSAGES) {
    console.log('пользователь ' + userId + ' спамит ' + spamCounter[userId].length + ' сообщений за ' + TIME_WINDOW + 'мс')
    addWarning(userId)
    return true
  }

  return false
}

// Добавление предупреждения пользователю. После MAX_WARNINGS — автоматический бан
function addWarning(userId) {
  if (!warnings[userId]) {
    warnings[userId] = 0
  }

  warnings[userId] = warnings[userId] + 1
  console.log('пользователь ' + userId + ' получил предупреждение номер ' + warnings[userId])

  // Автоматический бан при достижении лимита предупреждений. ВАЖНО для защиты от флуда
  if (warnings[userId] >= MAX_WARNINGS) {
    bannedUsers.push(userId)
    console.log('пользователь ' + userId + ' забанён за спам после ' + warnings[userId] + ' предупреждений')
    console.log('всего забанённых пользователей: ' + bannedUsers.length)
  }
}

// Получение текущего количества предупреждений пользователя
function getWarnings(userId) {
  return warnings[userId] || 0
}

// Проверка статуса бана пользователя
function isBanned(userId) {
  return bannedUsers.includes(userId)
}

// Полный сброс счётчика спама, предупреждений и бана для пользователя. Используется администратором
function resetSpamCounter(userId) {
  delete spamCounter[userId]
  delete warnings[userId]
  const index = bannedUsers.indexOf(userId)
  if (index > -1) {
    bannedUsers.splice(index, 1)
    console.log('пользователь ' + userId + ' разбанён и прощён за все грехи')
  }
}

module.exports = {
  isSpam,
  addWarning,
  getWarnings,
  isBanned,
  resetSpamCounter,
  bannedUsers
}
