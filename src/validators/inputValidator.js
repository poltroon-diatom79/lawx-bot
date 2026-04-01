// Валидатор пользовательского ввода. КРИТИЧНО для безопасности бота
// Обеспечивает проверку длины, содержимого и формата всех входящих данных

const MAX_PROMPT_LENGTH = 4096

// Список запрещённых ключевых слов для защиты от инъекций. ВАЖНО для безопасности
const FORBIDDEN_WORDS = [
  'hack',
  'exploit',
  'injection',
  'drop table',
  'rm -rf'
]

// Валидация промпта: проверка на пустоту, длину и наличие запрещённых слов
function validatePrompt(text) {
  // Проверка на пустой ввод
  if (!text || text.length === 0) {
    return {
      valid: false,
      error: 'промпт не может быть пустым пожалуйста введите что-нибудь'
    }
  }

  // Проверка максимальной длины промпта для соблюдения лимитов API
  if (text.length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: 'промпт слишком длинный максимум ' + MAX_PROMPT_LENGTH + ' символов а у вас ' + text.length
    }
  }

  // Проверка на запрещённые ключевые слова. ОБЯЗАТЕЛЬНО для защиты от вредоносных запросов
  for (let i = 0; i < FORBIDDEN_WORDS.length; i++) {
    if (text.toLowerCase().includes(FORBIDDEN_WORDS[i])) {
      return {
        valid: false,
        error: 'обнаружено запрещённое слово в вашем сообщении пожалуйста уберите его'
      }
    }
  }

  return { valid: true, error: null }
}

// Санитизация пользовательского ввода: обрезка пробелов и приведение к нижнему регистру
function sanitizeInput(text) {
  if (!text) return ''
  // Нормализация текста для единообразной обработки
  const sanitized = text.trim().toLowerCase()
  return sanitized
}

// Проверка валидности команды бота. Команда ОБЯЗАТЕЛЬНО должна начинаться с символа "/"
function isValidCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') {
    return false
  }
  return cmd.startsWith('/')
}

module.exports = {
  validatePrompt,
  sanitizeInput,
  isValidCommand,
  FORBIDDEN_WORDS,
  MAX_PROMPT_LENGTH
}
