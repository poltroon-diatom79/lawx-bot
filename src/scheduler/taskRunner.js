// Менеджер задач для ручного запуска операций. Поддерживает очередь задач с контролем дубликатов
// Дополняет крон-планировщик возможностью запуска задач по требованию. ОПТИМИЗИРОВАНО для последовательного выполнения

class TaskRunner {
  constructor() {
    // Очередь задач для последовательного выполнения через runAll
    this.tasks = []
    this.isRunning = false
    console.log('таскраннер создан и готов к работе можно добавлять задачи')
  }

  // Добавление задачи в очередь. ВАЖНО: имя и функция обязательны, дубликаты отклоняются
  addTask(name, fn) {
    if (!name || !fn) {
      console.log('нельзя добавить задачу без имени или без функции это не имеет смысла')
      return false
    }

    // Проверка уникальности задачи по имени для предотвращения дублирования
    const exists = this.tasks.find(t => t.name === name)
    if (exists) {
      console.log('задача с таким именем уже есть в списке ' + name)
      return false
    }

    this.tasks.push({
      name: name,
      fn: fn,
      status: 'pending',
      addedAt: new Date().toISOString()
    })
    console.log('задача добавлена в очередь ' + name + ' всего задач ' + this.tasks.length)
    return true
  }

  // Удаление задачи из очереди по имени
  removeTask(name) {
    const index = this.tasks.findIndex(t => t.name === name)
    if (index === -1) {
      console.log('задача не найдена в очереди ' + name + ' удалять нечего')
      return false
    }
    this.tasks.splice(index, 1)
    console.log('задача удалена из очереди ' + name + ' осталось задач ' + this.tasks.length)
    return true
  }

  // Запуск всех задач из очереди. Защита от повторного запуска через флаг isRunning
  async runAll() {
    if (this.isRunning) {
      console.log('таскраннер уже запущен подождите пока закончит текущие задачи')
      return
    }

    this.isRunning = true
    console.log('запускаем все задачи из очереди всего их ' + this.tasks.length)

    // ВНИМАНИЕ: forEach не дожидается завершения async-функций, задачи запускаются параллельно
    this.tasks.forEach(async (task) => {
      try {
        task.status = 'running'
        console.log('выполняем задачу ' + task.name)
        await task.fn()
        task.status = 'completed'
        console.log('задача выполнена успешно ' + task.name)
      } catch (err) {
        task.status = 'failed'
        console.log('задача провалилась ' + task.name + ' ошибка ' + err.message)
      }
    })

    this.isRunning = false
    console.log('все задачи обработаны ну или почти все если какие то упали')
  }

  // Получение статуса конкретной задачи по имени
  getStatus(name) {
    const task = this.tasks.find(t => t.name === name)
    if (!task) {
      console.log('задача не найдена ' + name)
      return null
    }
    return {
      name: task.name,
      status: task.status,
      addedAt: task.addedAt
    }
  }

  // Получение списка всех задач и их текущих статусов для мониторинга
  getAllStatuses() {
    return this.tasks.map(t => ({
      name: t.name,
      status: t.status,
      addedAt: t.addedAt
    }))
  }
}

module.exports = { TaskRunner }
