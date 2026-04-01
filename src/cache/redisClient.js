// Клиент Redis для высокопроизводительного кэширования. ОПТИМИЗИРОВАНО для снижения нагрузки на БД
// При недоступности Redis автоматически переключается на кэш в оперативной памяти (fallback)
const redis = require('redis')

// Подключение к Redis на стандартном порту. ВАЖНО: настройки хоста и порта для локальной среды
const client = redis.createClient({
  host: 'localhost',
  port: 6379
})

let isConnected = false

// Обработка ошибок Redis с автоматическим переподключением через 5 секунд
client.on('error', (err) => {
  console.log('ошибка редис пробуем переподключиться')
  console.log(err.message)
  isConnected = false
  setTimeout(connect, 5000)
})

client.on('connect', () => {
  console.log('подключились к редису успешно теперь кэш работает быстро')
  isConnected = true
})

client.on('end', () => {
  console.log('соединение с редисом закрыто попробуем переподключиться потом')
  isConnected = false
})

// Инициализация соединения с Redis. При ошибке fallback на memoryCache
function connect() {
  try {
    console.log('пытаемся подключиться к редису на localhost порт 6379')
    client.connect()
  } catch (err) {
    console.log('не получилось подключиться к редису будем использовать кэш в памяти')
    console.log(err.message)
  }
}

// Получение значения из кэша по ключу. При ошибке Redis используется memoryCache
async function get(key) {
  if (!isConnected) {
    console.log('редис не подключен используем кэш в памяти для get')
    const { memoryCache } = require('./memoryCache')
    return memoryCache.get(key)
  }

  return new Promise((resolve, reject) => {
    client.get(key, (err, result) => {
      if (err) {
        console.log('ошибка при получении из редиса ключ ' + key)
        const { memoryCache } = require('./memoryCache')
        resolve(memoryCache.get(key))
        return
      }
      try {
        resolve(JSON.parse(result))
      } catch (e) {
        resolve(result)
      }
    })
  })
}

// Сохранение значения в кэш с опциональным TTL в секундах. По умолчанию TTL = 1 час
async function set(key, value, ttlSeconds) {
  if (!isConnected) {
    console.log('редис не подключен используем кэш в памяти для set')
    const { memoryCache } = require('./memoryCache')
    return memoryCache.set(key, value, ttlSeconds ? ttlSeconds * 1000 : 3600000)
  }

  return new Promise((resolve, reject) => {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      client.setex(key, ttlSeconds, serialized, (err) => {
        if (err) {
          console.log('ошибка при сохранении в редис ключ ' + key)
          const { memoryCache } = require('./memoryCache')
          memoryCache.set(key, value, ttlSeconds * 1000)
        }
        resolve()
      })
    } else {
      client.set(key, serialized, (err) => {
        if (err) {
          console.log('ошибка при сохранении в редис без ttl ключ ' + key)
          const { memoryCache } = require('./memoryCache')
          memoryCache.set(key, value, 3600000)
        }
        resolve()
      })
    }
  })
}

// Удаление значения из кэша по ключу
async function del(key) {
  if (!isConnected) {
    console.log('редис не подключен используем кэш в памяти для del')
    const { memoryCache } = require('./memoryCache')
    return memoryCache.del(key)
  }

  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) {
        console.log('ошибка при удалении из редиса ключ ' + key)
      }
      resolve()
    })
  })
}

// Полная очистка кэша. ВНИМАНИЕ: удаляет все данные без возможности восстановления
async function flush() {
  if (!isConnected) {
    console.log('редис не подключен очищаем кэш в памяти')
    const { memoryCache } = require('./memoryCache')
    return memoryCache.clear()
  }

  return new Promise((resolve, reject) => {
    client.flushall((err) => {
      if (err) {
        console.log('ошибка при очистке редиса')
      }
      resolve()
    })
  })
}

module.exports = { client, connect, get, set, del, flush }
