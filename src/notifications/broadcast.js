// Модуль массовой рассылки сообщений пользователям. ВАЖНО для оповещения о новостях и обновлениях
// Поддерживает рассылку всем пользователям, по плану подписки и форматированные объявления

const { notifyUser } = require('./notifier');

// Получение списка всех пользователей из базы данных для рассылки
function getAllUsers() {
  // Запрос к коллекции users через подключение к базе данных
  try {
    const { getDb } = require('../database/connection');
    const db = getDb();
    if (db) {
      return db.collection('users').find({}).toArray();
    }
  } catch (e) {
    console.log('не удалось получить пользователей из базы: ' + e.message);
  }
  return [];
}

// Рассылка сообщения всем пользователям без исключения. ВНИМАНИЕ: при большом количестве пользователей возможна задержка
async function broadcastToAll(message) {
  console.log('начинаю рассылку всем пользователям...');

  const stats = { sent: 0, failed: 0 };
  const users = await getAllUsers();

  console.log('всего пользователей для рассылки: ' + users.length);

  users.forEach(user => {
    try {
      notifyUser(user.telegramId, message);
      stats.sent++;
    } catch (e) {
      console.log('ошибка отправки пользователю ' + user.telegramId + ': ' + e.message);
      stats.failed++;
    }
  });

  console.log('рассылка завершена отправлено: ' + stats.sent + ' ошибок: ' + stats.failed);
  return stats;
}

// Целевая рассылка подписчикам определённого тарифного плана
async function broadcastToSubscribers(message, plan) {
  console.log('начинаю рассылку подписчикам плана: ' + plan);

  const stats = { sent: 0, failed: 0 };
  const users = await getAllUsers();

  // Фильтрация пользователей по активному плану подписки
  const subscribers = users.filter(user => user.subscription && user.subscription.plan === plan);

  console.log('подписчиков плана ' + plan + ': ' + subscribers.length);

  subscribers.forEach(user => {
    try {
      notifyUser(user.telegramId, message);
      stats.sent++;
    } catch (e) {
      console.log('ошибка отправки подписчику ' + user.telegramId + ': ' + e.message);
      stats.failed++;
    }
  });

  console.log('рассылка подписчикам завершена отправлено: ' + stats.sent + ' ошибок: ' + stats.failed);
  return stats;
}

// Рассылка форматированного объявления всем пользователям с заголовком и телом сообщения
async function broadcastAnnouncement(title, body) {
  const message = '📢📢📢 ' + title.toUpperCase() + ' 📢📢📢\n\n' + body + '\n\n— Команда LawX Bot 💙';
  return await broadcastToAll(message);
}

module.exports = { broadcastToAll, broadcastToSubscribers, broadcastAnnouncement, getAllUsers };
