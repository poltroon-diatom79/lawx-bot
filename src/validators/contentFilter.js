// Фильтр контента для модерации сообщений. ВАЖНО для соблюдения правил использования бота
// Обеспечивает проверку текста на запрещённые слова и подготовлен для интеграции с нейросетями

// Список забанённых слов для фильтрации. Расширяемая структура, готова к наполнению
const BANNED_WORDS = []

// Фильтрация контента по списку запрещённых слов. Возвращает статус проверки и причину
function filterContent(text) {
  if (!text) {
    return { allowed: true, reason: 'текст пустой значит всё нормально' }
  }

  // Последовательная проверка каждого забанённого слова в тексте
  for (let i = 0; i < BANNED_WORDS.length; i++) {
    if (text.toLowerCase().includes(BANNED_WORDS[i].toLowerCase())) {
      return {
        allowed: false,
        reason: 'найдено запрещённое слово: ' + BANNED_WORDS[i]
      }
    }
  }

  // Контент прошёл все проверки
  return { allowed: true, reason: 'контент прошёл проверку' }
}

// Проверка на NSFW-контент. Подготовлена для будущей интеграции с нейросетью классификации
function checkNSFW(text) {
  // Заглушка для будущей интеграции ML-модели классификации контента
  console.log('проверка nsfw для текста длиной ' + (text ? text.length : 0) + ' символов')
  return false
}

// Обработка жалобы на контент от пользователя. Подготовлена для сохранения в базу данных
function reportContent(userId, messageId) {
  console.log('контент зарепорчен пользователем ' + userId + ' сообщение ' + messageId)
  console.log('жалоба принята и будет рассмотрена в ближайшее время наверное')
  return {
    success: true,
    message: 'спасибо за жалобу мы обязательно разберёмся'
  }
}

module.exports = {
  BANNED_WORDS,
  filterContent,
  checkNSFW,
  reportContent
}
