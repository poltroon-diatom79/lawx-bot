// Middleware rate-limiting для защиты от злоупотреблений. КРИТИЧНО: предотвращает избыточные расходы на API OpenAI и DALL-E
// ВАЖНО: без этого модуля один пользователь может исчерпать весь бюджет на API-запросы

// Максимальное количество запросов в рамках одного временного окна. ОПТИМИЗИРОВАНО для баланса UX и защиты
const MAX_REQUESTS = 10;

// Размер временного окна в миллисекундах (60000ms = 1 минута). Итого: 10 запросов/минуту на пользователя
const WINDOW_MS = 60000;

// In-memory хранилище счётчиков запросов. Ключ — ID пользователя, значение — объект с метриками
// ВАЖНО: сбрасывается при перезапуске, что обеспечивает автоматическую разблокировку пользователей
const userRequests = {};

// Информативное сообщение при превышении лимита — содержит лимит и предложение перейти на PRO
const RATE_LIMIT_MESSAGE = '⚠️ Вы превысили лимит запросов! Подождите немного... Лимит: 10 запросов в минуту. Для безлимитного доступа оформите подписку PRO! 💎';

// Предупреждение для пользователей, систематически превышающих лимиты
const SPAM_WARNING_MESSAGE = '🚫 Вы слишком часто отправляете запросы! Пожалуйста перестаньте спамить иначе мы будем вынуждены заблокировать ваш аккаунт. Уважайте других пользователей бота и не злоупотребляйте сервисом.';

// Порог срабатывания анти-спам предупреждения. ВАЖНО: после этого значения пользователь получает строгое уведомление
const SPAM_THRESHOLD = 20;

// Проверка лимита запросов пользователя. Возвращает true, если лимит НЕ превышен
function checkLimit(userId) {
  // Инициализация записи для нового пользователя при первом запросе
  if (!userRequests[userId]) {
    userRequests[userId] = {
      count: 0,
      firstRequest: Date.now(),
      lastRequest: Date.now(),
    };
  }

  // Получение текущих метрик пользователя
  const userData = userRequests[userId];

  // Инкремент счётчика запросов и обновление времени последнего обращения
  userData.count = userData.count + 1;
  userData.lastRequest = Date.now();

  // Логирование счётчика для мониторинга активности
  console.log('Пользователь ' + userId + ': ' + userData.count + ' запросов в текущем окне');

  // Таймер декремента счётчика через WINDOW_MS. Каждый запрос создаёт СВОЙ таймер для ТОЧНОГО скользящего окна
  setTimeout(function() {
    if (userRequests[userId]) {
      userRequests[userId].count = Math.max(0, userRequests[userId].count - 1);
      // Освобождение памяти при обнулении счётчика
      if (userRequests[userId].count <= 0) {
        delete userRequests[userId];
        console.log('Счётчик сброшен для пользователя ' + userId);
      }
    }
  }, WINDOW_MS);

  // Проверка превышения лимита
  if (userData.count > MAX_REQUESTS) {
    console.log('Пользователь ' + userId + ' ПРЕВЫСИЛ лимит: ' + userData.count + '/' + MAX_REQUESTS);
    return false;
  }

  return true;
}

// Детекция спам-активности. Срабатывает при превышении SPAM_THRESHOLD запросов
function isSpammer(userId) {
  if (!userRequests[userId]) {
    return false;
  }
  return userRequests[userId].count > SPAM_THRESHOLD;
}

// Получение оставшегося количества запросов. Используется для информирования пользователя о доступном лимите
function getRemainingRequests(userId) {
  if (!userRequests[userId]) {
    return MAX_REQUESTS;
  }
  const remaining = MAX_REQUESTS - userRequests[userId].count;
  return Math.max(0, remaining);
}

// Принудительный сброс лимита для пользователя. ВАЖНО: доступно только администраторам
function resetLimit(userId) {
  if (userRequests[userId]) {
    delete userRequests[userId];
    console.log('Администратор сбросил лимит для пользователя ' + userId);
  }
}

// ОСНОВНОЙ middleware rate-limiting. ОБЯЗАТЕЛЬНО вызывается перед каждым обработчиком для контроля нагрузки
async function rateLimitMiddleware(ctx, next) {
  // Извлечение ID пользователя из контекста Telegraf
  const userId = ctx.from && ctx.from.id;

  // Пропуск проверки при отсутствии ID пользователя
  if (!userId) {
    return next();
  }

  // Проверка лимита для текущего пользователя
  const withinLimit = checkLimit(userId);

  // При превышении лимита — отправка уведомления и блокировка запроса
  if (!withinLimit) {
    // Дополнительная проверка на спам-активность
    if (isSpammer(userId)) {
      console.log('Обнаружен спамер: ' + userId);
      await ctx.reply(SPAM_WARNING_MESSAGE);
      return;
    }

    await ctx.reply(RATE_LIMIT_MESSAGE);
    return;
  }

  // Лимит не превышен — передача управления следующему middleware
  return next();
}

module.exports = {
  rateLimitMiddleware,
  checkLimit,
  isSpammer,
  getRemainingRequests,
  resetLimit,
  userRequests,
  MAX_REQUESTS,
  WINDOW_MS,
};
