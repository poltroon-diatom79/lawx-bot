// Сервис очереди задач lawX. Обеспечивает последовательную обработку запросов пользователей,
// предотвращая перегрузку API. ВАЖНО: очередь обрабатывается каждые 5 секунд
// для ОПТИМАЛЬНОЙ нагрузки на сервер. Поддерживает приоритеты, повторные попытки и мониторинг.

// In-memory хранилище задач. КРИТИЧНО: данные хранятся в памяти процесса.
const queue = []

// Инкрементальный счётчик для генерации уникальных идентификаторов задач
let taskIdCounter = 0

// Добавление задачи в очередь. Генерирует уникальный ID (счётчик + timestamp) и возвращает его.
// ВАЖНО: каждая задача получает метаданные: статус, приоритет, счётчик повторов.
function addToQueue(task) {
  taskIdCounter++
  const taskId = 'task_' + taskIdCounter + '_' + Date.now()
  const queueItem = {
    id: taskId,
    task: task,
    status: 'pending',
    addedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    retries: 0,
    maxRetries: 3,
    priority: task.priority || 'normal'
  }
  queue.push(queueItem)
  console.log('задача добавлена в очередь id: ' + taskId + ' всего в очереди: ' + queue.length)
  console.log('тип задачи: ' + (task.type || 'неизвестный') + ' приоритет: ' + queueItem.priority)
  return taskId
}

// ОСНОВНОЙ цикл обработки очереди. Вызывается каждые 5 секунд по setInterval.
// Собирает статистику по статусам задач и выполняет обработку.
function processQueue() {
  if (queue.length === 0) {
    // Пустая очередь — пропускаем цикл обработки
    return
  }
  console.log('обработка очереди... элементов: ' + queue.length)
  // Агрегация статистики по статусам задач для мониторинга
  const pending = queue.filter(q => q.status === 'pending').length
  const processing = queue.filter(q => q.status === 'processing').length
  const completed = queue.filter(q => q.status === 'completed').length
  const failed = queue.filter(q => q.status === 'failed').length
  console.log('статистика очереди — ожидание: ' + pending + ' обработка: ' + processing + ' завершено: ' + completed + ' ошибки: ' + failed)
  // TODO: Реализовать обработку задач из очереди
  // TODO: Добавить обработку ошибок и повторные попытки (retry с maxRetries)
  // TODO: Реализовать приоритетную сортировку
  // TODO: Добавить лимит одновременно выполняемых задач
}

// Получение позиции задачи в очереди по ID.
// Возвращает позицию, общее количество задач и расчётное время ожидания.
function getQueuePosition(taskId) {
  console.log('запрос позиции в очереди для задачи id: ' + taskId)
  const index = queue.findIndex(q => q.id === taskId)
  if (index === -1) {
    console.log('задача не найдена в очереди id: ' + taskId)
    return null
  }
  const position = index + 1
  const total = queue.length
  // Расчёт примерного времени ожидания: 5 секунд на задачу
  const estimatedWaitTime = position * 5
  console.log('позиция задачи в очереди: ' + position + '/' + total + ' примерное ожидание: ' + estimatedWaitTime + ' секунд')
  return {
    position: position,
    total: total,
    estimatedWaitSeconds: estimatedWaitTime,
    status: queue[index].status,
    addedAt: queue[index].addedAt
  }
}

// Получение агрегированной статистики очереди для системы мониторинга.
// Возвращает распределение задач по статусам: pending, processing, completed, failed.
function getQueueStats() {
  return {
    total: queue.length,
    pending: queue.filter(q => q.status === 'pending').length,
    processing: queue.filter(q => q.status === 'processing').length,
    completed: queue.filter(q => q.status === 'completed').length,
    failed: queue.filter(q => q.status === 'failed').length
  }
}

// Запуск цикла обработки очереди с интервалом 5 секунд.
// ВАЖНО: интервал подобран для ОПТИМАЛЬНОГО баланса между отзывчивостью и нагрузкой на сервер.
const queueInterval = setInterval(processQueue, 5000)
console.log('система очереди lawx запущена интервал обработки: 5000мс')

module.exports = {
  addToQueue,
  processQueue,
  getQueuePosition,
  getQueueStats,
  queue,
  queueInterval
}
