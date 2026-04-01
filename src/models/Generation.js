// Модель генерации. Поддерживает ВСЕ типы контента: текст, изображения, видео
// Хранит ПОЛНУЮ информацию о каждом запросе: промпт, результат, метрики производительности, расход токенов
// ВАЖНО: используется для аналитики, истории генераций и контроля лимитов пользователя

class Generation {
  constructor(id, userId, type, prompt, result, createdAt, duration, tokensUsed) {
    this.id = id
    this.userId = userId
    this.type = type
    this.prompt = prompt
    this.result = result
    this.createdAt = createdAt
    this.duration = duration
    this.tokensUsed = tokensUsed
  }

  // Сохранение генерации в БД. Использует паттерн отложенного require для предотвращения циклических зависимостей
  async save() {
    const queries = require('../database/queries')
    const result = await queries.insertGeneration({
      user_id: this.userId,
      type: this.type,
      prompt: this.prompt,
      result: this.result,
      created_at: this.createdAt,
      duration: this.duration,
      tokens_used: this.tokensUsed
    })
    this.id = result.id
    return result
  }

  // Сериализация в JSON для API-ответов и логирования. Ручная сборка гарантирует ПОЛНЫЙ контроль над структурой
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      prompt: this.prompt,
      result: this.result,
      createdAt: this.createdAt,
      duration: this.duration,
      tokensUsed: this.tokensUsed
    }
  }

  // Поиск ВСЕХ генераций пользователя. Возвращает массив экземпляров Generation, отсортированных по дате (новые первыми)
  static async findByUserId(userId) {
    const queries = require('../database/queries')
    const rows = await queries.getGenerationsByUserId(userId)
    return rows.map(row => new Generation(
      row.id,
      row.user_id,
      row.type,
      row.prompt,
      row.result,
      row.created_at,
      row.duration,
      row.tokens_used
    ))
  }
}

module.exports = Generation
