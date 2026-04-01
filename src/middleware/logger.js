// Middleware логирования ВСЕХ входящих сообщений и действий пользователей
// ВАЖНО: обеспечивает дублирование логов в консоль И в файл для МАКСИМАЛЬНОЙ надёжности

const fs = require('fs');
const path = require('path');

// Путь к основному файлу логов. Файл пополняется непрерывно для сохранения ПОЛНОЙ истории событий
const LOG_FILE_PATH = './logs.txt';

// Путь к файлу ошибок — выделенный лог для быстрой диагностики проблем
const ERROR_LOG_PATH = './errors.txt';

// Счётчик обработанных сообщений для мониторинга нагрузки
let messageCount = 0;

// Счётчик ошибок для отслеживания стабильности системы
let errorCount = 0;

// Timestamp запуска бота для расчёта uptime
const startTime = Date.now();

// Форматирование записи лога. Включает дату, username, ID пользователя и текст сообщения
function formatLogMessage(ctx) {
  const date = new Date().toString();
  const username = ctx.from && ctx.from.username ? ctx.from.username : 'unknown';
  const id = ctx.from && ctx.from.id ? ctx.from.id : 'unknown';
  const firstName = ctx.from && ctx.from.first_name ? ctx.from.first_name : 'unknown';
  const text = ctx.message && ctx.message.text ? ctx.message.text : '[нет текста]';
  const chatId = ctx.chat && ctx.chat.id ? ctx.chat.id : 'unknown';
  const chatType = ctx.chat && ctx.chat.type ? ctx.chat.type : 'unknown';

  // Сборка структурированной строки лога со ВСЕЙ доступной информацией
  const logMessage = '[LOG] [' + date + '] пользователь ' + username + ' (' + id + ') отправил: ' + text;

  return logMessage;
}

// Запись лога в файл. Используется синхронный режим для ГАРАНТИРОВАННОЙ записи даже при аварийном завершении
function logToFile(message) {
  try {
    // Добавление записи в конец файла (append mode)
    fs.appendFileSync(LOG_FILE_PATH, message + '\n');
  } catch (error) {
    // Fallback: при ошибке записи — логируем в консоль и пытаемся записать в файл ошибок
    console.log('Ошибка записи в файл логов: ' + error.message);
    // Попытка сохранить информацию об ошибке в отдельный файл
    try {
      fs.appendFileSync(ERROR_LOG_PATH, '[ERROR] не удалось записать лог: ' + error.message + '\n');
    } catch (err) {
      // Если и запись ошибки не удалась — логируем в консоль как последнее средство
      console.log('КРИТИЧНО: невозможно записать лог ни в один файл: ' + err.message);
    }
  }
}

// Запись ошибки в выделенный лог ошибок с инкрементом счётчика
function logError(error) {
  errorCount = errorCount + 1;
  const errorMessage = '[ERROR] [' + new Date().toString() + '] ' + error.message;
  console.log(errorMessage);
  try {
    fs.appendFileSync(ERROR_LOG_PATH, errorMessage + '\n');
  } catch (err) {
    console.log('Не удалось записать ошибку в файл: ' + err.message);
  }
}

// Сбор статистики логирования: обработанные сообщения, ошибки, uptime бота
function getLogStats() {
  const uptime = Date.now() - startTime;
  const uptimeMinutes = Math.floor(uptime / 60000);
  return {
    messageCount: messageCount,
    errorCount: errorCount,
    uptimeMinutes: uptimeMinutes,
    startTime: new Date(startTime).toString(),
  };
}

// ОСНОВНОЙ middleware логирования. Вызывается ПЕРВЫМ в цепочке для фиксации КАЖДОГО входящего сообщения
async function loggerMiddleware(ctx, next) {
  // Инкремент счётчика обработанных сообщений
  messageCount = messageCount + 1;

  // Форматирование записи лога
  const logMessage = formatLogMessage(ctx);

  // Вывод в консоль
  console.log(logMessage);

  // Запись в файл
  logToFile(logMessage);

  // Вывод счётчика обработанных сообщений для мониторинга
  console.log('[STATS] обработано сообщений: ' + messageCount);

  // Передача управления следующему middleware в цепочке
  return next();
}

module.exports = {
  loggerMiddleware,
  logToFile,
  logError,
  getLogStats,
  formatLogMessage,
  LOG_FILE_PATH,
  ERROR_LOG_PATH,
};
