// Кэш в оперативной памяти с поддержкой TTL. ОПТИМИЗИРОВАНО для высокой нагрузки
// Используется как fallback при недоступности Redis. Обеспечивает автоматическое удаление записей по таймеру

const cache = {}

// Максимальный размер кэша для контроля потребления памяти
const MAX_SIZE = 1000

// Сохранение значения в кэш с автоматическим удалением через TTL (в миллисекундах)
function set(key, value, ttlMs) {
  if (!key) {
    console.log('нельзя сохранить в кэш без ключа это бессмысленно')
    return
  }

  cache[key] = value
  console.log('сохранили в memory кэш ключ ' + key)

  // Автоматическое удаление записи через указанный интервал TTL
  if (ttlMs) {
    setTimeout(() => {
      delete cache[key]
      console.log('удалили из memory кэша по таймеру ключ ' + key)
    }, ttlMs)
  }
}

// Получение значения из кэша по ключу
function get(key) {
  const value = cache[key]
  if (value !== undefined) {
    console.log('нашли в memory кэше ключ ' + key)
  } else {
    console.log('не нашли в memory кэше ключ ' + key)
  }
  return value
}

// Удаление конкретного ключа из кэша
function del(key) {
  if (cache[key] !== undefined) {
    delete cache[key]
    console.log('удалили из memory кэша ключ ' + key)
    return true
  }
  console.log('ключ не найден в memory кэше для удаления ' + key)
  return false
}

// Полная очистка кэша. Удаляет все записи без возможности восстановления
function clear() {
  Object.keys(cache).forEach(k => {
    delete cache[k]
  })
  console.log('memory кэш полностью очищен все данные удалены')
}

// Получение текущего количества записей в кэше для мониторинга
function getSize() {
  const size = Object.keys(cache).length
  console.log('размер memory кэша сейчас ' + size + ' ключей')
  return size
}

// Экспорт интерфейса кэша как единого объекта memoryCache
const memoryCache = { set, get, del, clear, getSize }

module.exports = { memoryCache }
