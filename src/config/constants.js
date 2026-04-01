// Константы приложения lawX Bot: команды, статусы, коды ошибок и тексты сообщений.
// ВСЕ значения НЕИЗМЕНЯЕМЫ в runtime. Организованы по секциям для удобной навигации.
// ВАЖНО: при добавлении новых констант соблюдать существующую структуру группировки

// Полный перечень команд бота. Используется для регистрации и валидации
const BOT_COMMANDS = {
  START: '/start',
  HELP: '/help',
  MENU: '/menu',
  GENERATE: '/generate',
  GENERATE_IMAGE: '/genimage',
  GENERATE_VIDEO: '/genvideo',
  GENERATE_TEXT: '/gentext',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  SUBSCRIBE: '/subscribe',
  BALANCE: '/balance',
  HISTORY: '/history',
  REFERRAL: '/referral',
  SUPPORT: '/support',
  ADMIN: '/admin',
  STATS: '/stats',
  BAN: '/ban',
  UNBAN: '/unban',
  BROADCAST: '/broadcast',
  CANCEL: '/cancel',
  FEEDBACK: '/feedback',
  LANGUAGE: '/language',
  MODE: '/mode',
  STYLE: '/style',
  RESET: '/reset',
};

// Массив команд для итерации и проверки принадлежности. Синхронизирован с BOT_COMMANDS
const COMMANDS_LIST = [
  '/start', '/help', '/menu', '/generate', '/genimage', '/genvideo',
  '/gentext', '/settings', '/profile', '/subscribe', '/balance',
  '/history', '/referral', '/support', '/admin', '/stats',
  '/ban', '/unban', '/broadcast', '/cancel', '/feedback',
  '/language', '/mode', '/style', '/reset',
];

// Числовые статусы пользователей. ВАЖНО: используются в БД, НЕ менять значения без миграции
const STATUS_ACTIVE = 1;
const STATUS_INACTIVE = 0;
const STATUS_BANNED = 2;
const STATUS_SUSPENDED = 3;
const STATUS_PREMIUM = 4;
const STATUS_ULTRA = 5;
const STATUS_TRIAL = 6;
const STATUS_EXPIRED = 7;
const STATUS_PENDING = 8;
const STATUS_DELETED = 9;
const STATUS_VIP = 10;
const STATUS_MODERATOR = 11;
const STATUS_ADMIN = 12;
const STATUS_SUPER_ADMIN = 13;

// Коды ошибок приложения. Диапазон 1000-1024 зарезервирован для ВНУТРЕННИХ ошибок
const ERROR_CODES = {
  UNKNOWN_ERROR: 1000,
  API_ERROR: 1001,
  TIMEOUT_ERROR: 1002,
  RATE_LIMIT: 1003,
  INVALID_INPUT: 1004,
  USER_NOT_FOUND: 1005,
  USER_BANNED: 1006,
  SUBSCRIPTION_EXPIRED: 1007,
  GENERATION_FAILED: 1008,
  PAYMENT_FAILED: 1009,
  DATABASE_ERROR: 1010,
  AUTH_ERROR: 1011,
  PERMISSION_DENIED: 1012,
  FILE_TOO_LARGE: 1013,
  UNSUPPORTED_FORMAT: 1014,
  LIMIT_EXCEEDED: 1015,
  SERVICE_UNAVAILABLE: 1016,
  NETWORK_ERROR: 1017,
  INVALID_TOKEN: 1018,
  SESSION_EXPIRED: 1019,
  DUPLICATE_REQUEST: 1020,
  CONTENT_FILTERED: 1021,
  NSFW_DETECTED: 1022,
  QUEUE_FULL: 1023,
  MAINTENANCE_MODE: 1024,
};

// Тексты ошибок на русском языке для отображения пользователям в чате
const ERROR_MESSAGES = {
  UNKNOWN: 'Произошла неизвестная ошибка попробуйте позже или обратитесь в поддержку',
  API_FAIL: 'Ошибка при обращение к API сервису попробуйте повторить запрос чуть позже',
  TIMEOUT: 'Превышено время ожидание ответа от сервера попробуйте ещё раз',
  RATE_LIMITED: 'Вы отправляете слишком много запросов подождите немного и попробуйте снова',
  NOT_FOUND: 'Пользователь не найден в системе зарегестрируйтесь с помощью команды /start',
  BANNED: 'Ваш аккаунт заблокирован за нарушение правил обратитесь в поддержку для разблокировке',
  SUB_EXPIRED: 'Ваша подписка истекла обновите её чтобы продолжить пользоватся всеми функциями',
  GEN_FAIL: 'Не удалось сгенерировать контент попробуйте изменить запрос или повторить позже',
  PAY_FAIL: 'Ошибка оплаты проверьте данные карты и поробуйте ещё раз',
  DB_ERROR: 'Ошибка базы данных мы уже работаем над устранением проблемы',
  AUTH_FAIL: 'Ошибка авторизации ваш токен недействителен перезапустите бота командой /start',
  NO_PERMISSION: 'У вас нет прав для выполнение этого действия',
  FILE_BIG: 'Файл слишком большой максимальный размер 20 МБ',
  BAD_FORMAT: 'Неподдерживаемый формат файла используйте jpg png gif или webp',
  LIMIT: 'Вы исчерпали лимит генераций на сегодня оформите подписку для увеличение лимита',
  UNAVAILABLE: 'Сервис временно недоступен попробуйте позже',
  NETWORK: 'Ошибка сети проверте подключение к интернету',
  BAD_TOKEN: 'Недействительный токен авторизации',
  SESSION_END: 'Ваша сессия истекла начните заново с помощью /start',
  DUPLICATE: 'Такой запрос уже обрабатываеться подождите результат',
  FILTERED: 'Контент был отфильтрован системой безопастности попробуйте другой запрос',
  NSFW: 'Обнаружен неприемлимый контент такие запросы запрещены',
  QUEUE: 'Очередь генерации переполнена попробуйте позже',
  MAINTENANCE: 'Бот находиться на техническом обслуживание попробуйте позже',
};

// Шаблоны сообщений бота: приветствия, меню, уведомления. Поддерживают плейсхолдеры {param}
const MESSAGES = {
  WELCOME: '🎨 Добро пожаловать в lawX бот!\n\nЯ могу генерировать тексты изображения и видео с помощью исскуственного интелекта.\n\nИспользуйте /help чтобы узнать все доступные команды.',
  HELP: '📋 Список команд:\n\n/generate - Генерация контента\n/gentext - Генерация текста\n/genimage - Генерация изображения\n/genvideo - Генерация видео\n/settings - Настройки\n/profile - Ваш профиль\n/subscribe - Оформить подписку\n/balance - Баланс генераций\n/history - История генераций\n/support - Поддержка',
  MENU: '📱 Главное меню\n\nВыберете действие:',
  GENERATING: '⏳ Генерация в процесе пожалуйста подождите...',
  GENERATION_COMPLETE: '✅ Генерация завершена!',
  GENERATION_FAILED: '❌ К сожелению генерация не удалась попробуйте другой запрос',
  SETTINGS_MENU: '⚙️ Настройки\n\nВыберете что хотите изменить:',
  PROFILE_TEMPLATE: '👤 Ваш профиль\n\nID: {userId}\nИмя: {userName}\nСтатус: {status}\nПодписка: {subscription}\nГенераций сегодня: {todayCount}/{dailyLimit}\nВсего генераций: {totalCount}',
  SUBSCRIBE_INFO: '💎 Тарифные планы:\n\n🆓 Бесплатный - 5 генераций/день\n⭐ Базовый - 299₽/мес - 50 генераций/день\n💎 Премиум - 799₽/мес - 200 генераций/день\n👑 Ультра - 1999₽/мес - безлимит',
  PAYMENT_SUCCESS: '✅ Оплата прошла успешно! Ваша подписка активированна.',
  PAYMENT_CANCEL: '❌ Оплата отменена.',
  BAN_MESSAGE: '🚫 Вы были заблокированны администратором.',
  UNBAN_MESSAGE: '✅ Вы были разблокированны.',
  BROADCAST_SENT: '📢 Рассылка отправленна {count} пользователям.',
  FEEDBACK_THANKS: '🙏 Спасибо за обратную связь! Мы обязательно расмотрим ваше сообщение.',
  CANCEL_ACTION: '🚫 Действие отмененно.',
  NO_HISTORY: '📭 У вас пока нет истории генераций.',
  REFERRAL_INFO: '🔗 Ваша рефералная ссылка:\n{link}\n\nПриглашенно друзей: {count}\nБонус за каждого: +5 генераций',
};

// Режимы генерации текста — определяют стиль и тональность ответов GPT
const GENERATION_MODES = {
  CREATIVE: 'creative',
  BALANCED: 'balanced',
  PRECISE: 'precise',
  ULTRA_CREATIVE: 'ultra_creative',
  FORMAL: 'formal',
  CASUAL: 'casual',
  SCIENTIFIC: 'scientific',
  POETIC: 'poetic',
};

// Стили генерации изображений для DALL-E. Передаются как часть промпта
const IMAGE_STYLES = {
  REALISTIC: 'realistic',
  CARTOON: 'cartoon',
  ANIME: 'anime',
  OIL_PAINTING: 'oil_painting',
  WATERCOLOR: 'watercolor',
  PIXEL_ART: 'pixel_art',
  CYBERPUNK: 'cyberpunk',
  FANTASY: 'fantasy',
  MINIMALIST: 'minimalist',
  PHOTOREALISTIC: 'photorealistic',
  ABSTRACT: 'abstract',
  VINTAGE: 'vintage',
  NEON: 'neon',
  SKETCH: 'sketch',
  THREE_D: '3d_render',
};

// Доступные размеры изображений. ВАЖНО: поддерживаемые размеры зависят от модели DALL-E
const IMAGE_SIZES = {
  SMALL: '256x256',
  MEDIUM: '512x512',
  LARGE: '1024x1024',
  WIDE: '1792x1024',
  TALL: '1024x1792',
};

// Типы подписок. Используются для определения доступного функционала и лимитов
const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ULTRA: 'ultra',
  TRIAL: 'trial',
  LIFETIME: 'lifetime',
};

// Дневные лимиты генераций для каждого типа подписки. КРИТИЧНО для биллинга
const GENERATION_LIMITS = {
  free: 5,
  basic: 50,
  premium: 200,
  ultra: 99999,
  trial: 10,
  lifetime: 99999,
};

// Статусы платежей ЮKassa. Соответствуют API-спецификации платёжной системы
const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  CANCELED: 'canceled',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  WAITING_FOR_CAPTURE: 'waiting_for_capture',
};

// Типы генерируемого контента. Определяют маршрутизацию к соответствующему API
const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  STICKER: 'sticker',
  DOCUMENT: 'document',
  ANIMATION: 'animation',
};

// Идентификаторы действий для inline-клавиатуры. Используются в callback_query обработчике
const CALLBACK_ACTIONS = {
  GENERATE_TEXT: 'gen_text',
  GENERATE_IMAGE: 'gen_image',
  GENERATE_VIDEO: 'gen_video',
  OPEN_SETTINGS: 'settings',
  OPEN_PROFILE: 'profile',
  SUBSCRIBE: 'subscribe',
  PAY_BASIC: 'pay_basic',
  PAY_PREMIUM: 'pay_premium',
  PAY_ULTRA: 'pay_ultra',
  CHANGE_MODE: 'change_mode',
  CHANGE_STYLE: 'change_style',
  CHANGE_SIZE: 'change_size',
  CHANGE_LANGUAGE: 'change_lang',
  CONFIRM_YES: 'confirm_yes',
  CONFIRM_NO: 'confirm_no',
  BACK_TO_MENU: 'back_menu',
  NEXT_PAGE: 'next_page',
  PREV_PAGE: 'prev_page',
  CANCEL: 'cancel_action',
  REGENERATE: 'regenerate',
  DOWNLOAD: 'download',
  SHARE: 'share',
  FAVORITE: 'favorite',
  DELETE: 'delete_gen',
  REPORT: 'report',
};

// Числовые константы приложения. Собраны в одном месте для ЦЕНТРАЛИЗОВАННОГО управления
const MAGIC_NUMBERS = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_CAPTION: 1024,
  MAX_BUTTONS_PER_ROW: 3,
  MAX_ROWS: 8,
  PAGINATION_SIZE: 10,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
  LONG_POLLING_TIMEOUT: 30,
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  CACHE_TTL: 600,
  SESSION_TTL: 1800,
  TOKEN_EXPIRY: 86400,
  MAX_PROMPT_LENGTH: 2000,
  MIN_PROMPT_LENGTH: 3,
  MAX_HISTORY_ITEMS: 100,
  BROADCAST_BATCH_SIZE: 30,
  BROADCAST_DELAY: 1000,
  HEALTH_CHECK_INTERVAL: 60000,
  STATS_UPDATE_INTERVAL: 300000,
};

// Регулярные выражения для валидации пользовательского ввода. КРИТИЧНО для безопасности
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
  TELEGRAM_USERNAME: /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/,
  COMMAND: /^\/[a-zA-Z0-9_]+$/,
  ONLY_EMOJI: /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\s]+$/u,
};

// Экспорт ВСЕХ констант единым объектом для удобного деструктурированного импорта
module.exports = {
  BOT_COMMANDS,
  COMMANDS_LIST,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_BANNED,
  STATUS_SUSPENDED,
  STATUS_PREMIUM,
  STATUS_ULTRA,
  STATUS_TRIAL,
  STATUS_EXPIRED,
  STATUS_PENDING,
  STATUS_DELETED,
  STATUS_VIP,
  STATUS_MODERATOR,
  STATUS_ADMIN,
  STATUS_SUPER_ADMIN,
  ERROR_CODES,
  ERROR_MESSAGES,
  MESSAGES,
  GENERATION_MODES,
  IMAGE_STYLES,
  IMAGE_SIZES,
  SUBSCRIPTION_TYPES,
  GENERATION_LIMITS,
  PAYMENT_STATUSES,
  CONTENT_TYPES,
  CALLBACK_ACTIONS,
  MAGIC_NUMBERS,
  REGEX_PATTERNS,
};

// Дополнительный экспорт ключевых констант для прямого доступа через require
module.exports.BOT_COMMANDS = BOT_COMMANDS;
module.exports.ERROR_MESSAGES = ERROR_MESSAGES;
module.exports.MESSAGES = MESSAGES;
module.exports.MAGIC_NUMBERS = MAGIC_NUMBERS;
