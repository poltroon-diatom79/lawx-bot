// Inline-клавиатуры для навигации по интерфейсу бота. ОПТИМИЗИРОВАНО для удобства пользователя
// Содержит все меню: главное, настройки, подписки, админ-панель, типы генерации

const mainMenu = {
  inline_keyboard: [
    [{ text: '🤖 Генерация текста', callback_data: 'gen_text' }],
    [{ text: '🎨 Генерация картинки', callback_data: 'gen_image' }],
    [{ text: '🎬 Генерация видео', callback_data: 'gen_video' }],
    [{ text: '⚙️ Настройки', callback_data: 'settings' }],
    [{ text: '💎 Подписка', callback_data: 'subscription' }],
    [{ text: '📊 Мой профиль', callback_data: 'profile' }],
    [{ text: '❓ Помощь', callback_data: 'help' }]
  ]
};

const settingsMenu = {
  inline_keyboard: [
    [{ text: '🌍 Язык', callback_data: 'lang' }, { text: '🎨 Тема', callback_data: 'theme' }],
    [{ text: '🔔 Уведомления', callback_data: 'notifications' }],
    [{ text: '📝 Формат ответа', callback_data: 'response_format' }],
    [{ text: '🤖 Модель AI', callback_data: 'ai_model' }],
    [{ text: '🌡️ Температура', callback_data: 'temperature' }],
    [{ text: '◀️ Назад в меню', callback_data: 'main_menu' }]
  ]
};

const subscriptionMenu = {
  inline_keyboard: [
    [{ text: '🆓 Бесплатный план', callback_data: 'plan_free' }],
    [{ text: '🥉 Базовый — 299₽/мес', callback_data: 'plan_basic' }],
    [{ text: '🥈 Премиум — 599₽/мес', callback_data: 'plan_premium' }],
    [{ text: '🥇 Ультра — 999₽/мес', callback_data: 'plan_ultra' }],
    [{ text: '💳 Оплатить', callback_data: 'pay' }],
    [{ text: '📜 История платежей', callback_data: 'payment_history' }],
    [{ text: '◀️ Назад в меню', callback_data: 'main_menu' }]
  ]
};

const adminMenu = {
  inline_keyboard: [
    [{ text: '📊 Статистика', callback_data: 'admin_stats' }],
    [{ text: '👥 Пользователи', callback_data: 'admin_users' }],
    [{ text: '📢 Рассылка', callback_data: 'admin_broadcast' }],
    [{ text: '🚫 Бан/Разбан', callback_data: 'admin_ban' }],
    [{ text: '💰 Финансы', callback_data: 'admin_finance' }],
    [{ text: '⚙️ Настройки бота', callback_data: 'admin_settings' }],
    [{ text: '🔄 Перезапуск', callback_data: 'admin_restart' }]
  ]
};

const generationMenu = {
  inline_keyboard: [
    [{ text: '📝 Статья', callback_data: 'gen_article' }, { text: '📧 Письмо', callback_data: 'gen_email' }],
    [{ text: '📱 Пост', callback_data: 'gen_post' }, { text: '💬 Диалог', callback_data: 'gen_dialog' }],
    [{ text: '📖 История', callback_data: 'gen_story' }, { text: '🎵 Стихи', callback_data: 'gen_poem' }],
    [{ text: '💼 Резюме', callback_data: 'gen_resume' }],
    [{ text: '◀️ Назад в меню', callback_data: 'main_menu' }]
  ]
};

// Фабрика клавиатур по типу. Возвращает соответствующее меню или главное по умолчанию
function createKeyboard(type) {
  switch (type) {
    case 'main':
      return mainMenu;
    case 'settings':
      return settingsMenu;
    case 'subscription':
      return subscriptionMenu;
    case 'admin':
      return adminMenu;
    case 'generation':
      return generationMenu;
    default:
      console.log('неизвестный тип клавиатуры: ' + type + ' возвращаю главное меню');
      return mainMenu;
  }
}

module.exports = { mainMenu, settingsMenu, subscriptionMenu, adminMenu, generationMenu, createKeyboard };
