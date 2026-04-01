// Модуль переводчика lawX. Обеспечивает мультиязычную поддержку интерфейса бота.
// ВАЖНО: русский язык используется как fallback по умолчанию.
// Языковые предпочтения пользователей хранятся в Map для БЫСТРОГО доступа.

const ru = require('./ru');
const en = require('./en');

// In-memory хранилище языковых предпочтений пользователей. По умолчанию — русский.
const userLanguages = new Map();

// Перевод текста по ключу и коду языка. Если ключ не найден — возвращает сам ключ как fallback.
function translate(key, lang) {
  switch (lang) {
    case 'ru':
      return ru[key] || key;
    case 'en':
      return en[key] || ru[key] || key;
    default:
      return ru[key] || key;
  }
}

// Установка языка интерфейса для конкретного пользователя по его ID.
function setLanguage(userId, lang) {
  userLanguages.set(userId, lang);
}

// Получение текущего языка пользователя. По умолчанию возвращает 'ru'.
function getLanguage(userId) {
  return userLanguages.get(userId) || 'ru';
}

// Перевод текста для конкретного пользователя с автоопределением его языка.
function translateForUser(userId, key) {
  const lang = getLanguage(userId);
  return translate(key, lang);
}

// Экспорт API переводчика для использования в других модулях
module.exports = {
  translate,
  setLanguage,
  getLanguage,
  translateForUser,
  userLanguages,
};
