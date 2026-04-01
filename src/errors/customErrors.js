// Иерархия кастомных ошибок для типизированной обработки исключений
// Каждый класс содержит код ошибки и временную метку для диагностики. ВАЖНО для классификации сбоев

// Базовая ошибка бота. Родительский класс для всех кастомных ошибок
class BotError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    this.timestamp = new Date().toISOString()
    console.log('создана ошибка бота: ' + message + ' с кодом ' + code)
  }
}

// Ошибка внешнего API. Используется при сбоях OpenAI и DALL-E
class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    this.timestamp = new Date().toISOString()
    console.log('создана ошибка апи: ' + message + ' с кодом ' + code)
  }
}

// Ошибка базы данных. Используется при сбоях подключения или некорректных запросах
class DatabaseError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    this.timestamp = new Date().toISOString()
    console.log('создана ошибка базы данных: ' + message + ' с кодом ' + code)
  }
}

// Ошибка платёжной системы. Используется при отклонении или отмене платежей
class PaymentError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    this.timestamp = new Date().toISOString()
    console.log('создана ошибка оплаты: ' + message + ' с кодом ' + code)
  }
}

// Ошибка валидации входных данных. Используется при некорректном пользовательском вводе
class ValidationError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    this.timestamp = new Date().toISOString()
    console.log('создана ошибка валидации: ' + message + ' с кодом ' + code)
  }
}

module.exports = {
  BotError,
  ApiError,
  DatabaseError,
  PaymentError,
  ValidationError
}
