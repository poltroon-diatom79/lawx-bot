// Менеджер сессий пользователей. КРИТИЧНО: обеспечивает хранение состояния FSM (конечного автомата) для каждого пользователя
// Реализован на основе in-memory Map для МАКСИМАЛЬНОЙ скорости доступа к состояниям
// ВАЖНО: сессии хранятся в оперативной памяти — при перезапуске бота состояния сбрасываются
// Архитектурное решение: in-memory хранение ОПТИМАЛЬНО для текущей нагрузки, миграция на Redis запланирована

class Session {
  constructor() {
    this.sessions = new Map()
  }

  // Установка состояния FSM для пользователя. Принимает строковый идентификатор состояния (например, "waiting_for_prompt")
  setState(userId, state) {
    this.sessions.set(userId, state)
  }

  // Получение текущего состояния пользователя. Возвращает null, если сессия не инициализирована
  getState(userId) {
    return this.sessions.get(userId) || null
  }

  // Сброс состояния пользователя. Вызывается по завершении действия для возврата в начальное состояние
  clearState(userId) {
    this.sessions.delete(userId)
  }

  // Получение ВСЕХ активных сессий в формате массива пар [userId, state]. Используется в админ-панели и для отладки
  getAllSessions() {
    return Array.from(this.sessions.entries())
  }

  // Проверка наличия активной сессии у пользователя
  hasSession(userId) {
    return this.sessions.has(userId)
  }

  // Количество активных сессий. ВАЖНО: используется для мониторинга нагрузки на бота
  getActiveCount() {
    return this.sessions.size
  }
}

module.exports = new Session()
