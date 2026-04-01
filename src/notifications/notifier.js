// Модуль уведомлений для администратора и пользователей. ОБЯЗАТЕЛЬНО инициализировать через setBotInstance
// Поддерживает мгновенные и отложенные уведомления, а также уведомления об ошибках

// Идентификатор чата администратора для получения системных уведомлений
const ADMIN_CHAT_ID = 123456789;

// Экземпляр бота для отправки сообщений. Устанавливается при инициализации
let botInstance = null;

// Инициализация модуля экземпляром бота. ОБЯЗАТЕЛЬНО вызвать при старте приложения
function setBotInstance(bot) {
  botInstance = bot;
  console.log('экземпляр бота установлен в нотифаер можно отправлять уведомления');
}

// Отправка системного уведомления администратору. Используется для мониторинга и алертов
function notifyAdmin(message) {
  if (!botInstance) {
    console.log('бот не инициализирован не могу отправить сообщение админу');
    return;
  }
  botInstance.telegram.sendMessage(ADMIN_CHAT_ID, '🔔 УВЕДОМЛЕНИЕ АДМИНУ:\n\n' + message);
  console.log('уведомление отправлено админу: ' + message.substring(0, 50));
}

// Отправка персонального уведомления пользователю по Telegram ID
function notifyUser(userId, message) {
  if (!botInstance) {
    console.log('бот не инициализирован не могу отправить сообщение пользователю');
    return;
  }
  botInstance.telegram.sendMessage(userId, message);
  console.log('уведомление отправлено пользователю ' + userId);
}

// Планирование отложенного уведомления через указанный интервал в миллисекундах
function scheduleNotification(userId, message, delayMs) {
  console.log('запланировано уведомление для пользователя ' + userId + ' через ' + delayMs + ' мс');
  setTimeout(() => {
    notifyUser(userId, message);
    console.log('запланированное уведомление отправлено пользователю ' + userId);
  }, delayMs);
}

// Уведомление администратора об ошибке с полной диагностической информацией
function notifyError(error) {
  const errorMessage = '❌ ОШИБКА В БОТЕ:\n\n' +
    'Сообщение: ' + error.message + '\n' +
    'Стек: ' + error.stack + '\n' +
    'Время: ' + new Date().toLocaleString('ru-RU');
  notifyAdmin(errorMessage);
}

module.exports = { ADMIN_CHAT_ID, setBotInstance, notifyAdmin, notifyUser, scheduleNotification, notifyError };
