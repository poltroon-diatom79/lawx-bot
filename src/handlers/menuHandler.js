// Центральный обработчик главного меню и ВСЕХ callback query от inline-кнопок.
// Маршрутизация по callback_data реализована через switch/case для наглядности.
// ВАЖНО: это единая точка обработки навигации — все подменю и действия проходят через этот модуль.

const menuHandler = (bot) => {
    // Регистрируем команду /menu для отображения главного меню с навигацией
    bot.command('menu', async (ctx) => {
        try {
            console.log('пользователь ' + ctx.from.id + ' открыл главное меню');

            await ctx.reply('🏠 ГЛАВНОЕ МЕНЮ lawX 🏠\n\nВыбери что тебе нужно из списка ниже!! 👇👇', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔤 Генерация текста', callback_data: 'menu_generate_text' },
                            { text: '🎨 Генерация картинок', callback_data: 'menu_generate_image' }
                        ],
                        [
                            { text: '🎬 Генерация видео', callback_data: 'menu_generate_video' },
                            { text: '⚙️ Настройки', callback_data: 'menu_settings' }
                        ],
                        [
                            { text: '💎 Подписка', callback_data: 'menu_subscription' },
                            { text: '👤 Мой профиль', callback_data: 'menu_profile' }
                        ],
                        [
                            { text: '📊 Статистика', callback_data: 'menu_stats' },
                            { text: '❓ Помощь', callback_data: 'menu_help' }
                        ],
                        [
                            { text: '💰 Реферальная программа', callback_data: 'menu_referral' },
                            { text: '🌐 Сменить язык', callback_data: 'menu_language' }
                        ],
                        [
                            { text: '📋 История генераций', callback_data: 'menu_history' },
                            { text: '🎁 Промокод', callback_data: 'menu_promo' }
                        ],
                        [
                            { text: '⭐️ Оценить бота', callback_data: 'menu_rate' },
                            { text: '📞 Поддержка', callback_data: 'menu_support' }
                        ],
                        [
                            { text: '🔔 Уведомления', callback_data: 'menu_notifications' }
                        ]
                    ]
                }
            });
        } catch (e) {
            console.log('ошибка показа меню: ' + e);
        }
    });

    // Единый обработчик callback_query. Все нажатия inline-кнопок маршрутизируются здесь
    bot.on('callback_query', async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        const userId = ctx.from.id;

        console.log('пользователь ' + userId + ' нажал кнопку: ' + callbackData);

        try {
            // ОБЯЗАТЕЛЬНО отвечаем на callback query, чтобы убрать индикатор загрузки у клиента
            await ctx.answerCbQuery();

            switch (callbackData) {
                case 'menu_generate_text':
                    await ctx.editMessageText('🔤✨ ГЕНЕРАЦИЯ ТЕКСТА ✨🔤\n\n' +
                        'Выбери тип текста который хочешь сгенерировать или просто отправь свой запрос!!\n\n' +
                        '💡 Совет: Чем подробнее ты опишешь что тебе нужно тем лучше будет результат!!!\n\n' +
                        '⚡️ Текущая модель: GPT-4 Turbo\n' +
                        '📊 Осталось запросов: загрузка...', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📝 Свободный запрос', callback_data: 'gen_text_free' },
                                    { text: '📧 Написать письмо', callback_data: 'gen_text_email' }
                                ],
                                [
                                    { text: '📄 Статья/Пост', callback_data: 'gen_text_article' },
                                    { text: '💼 Резюме', callback_data: 'gen_text_resume' }
                                ],
                                [
                                    { text: '🎓 Учебный текст', callback_data: 'gen_text_study' },
                                    { text: '✍️ Рерайт текста', callback_data: 'gen_text_rewrite' }
                                ],
                                [
                                    { text: '🔙 Назад в меню', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_generate_image':
                    await ctx.editMessageText('🎨🖼 ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ 🖼🎨\n\n' +
                        'Создай уникальное изображение с помощью DALL-E 3!!!\n\n' +
                        '🎯 Как использовать:\n' +
                        '1. Выбери стиль из списка ниже\n' +
                        '2. Отправь текстовое описание\n' +
                        '3. Подожди 10-30 секунд\n' +
                        '4. Получи свою картинку!!!\n\n' +
                        '⚠️ Нельзя генерировать: NSFW контент реальных людей насилие', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🖼 Реалистичное фото', callback_data: 'gen_img_realistic' },
                                    { text: '🎨 Арт/Иллюстрация', callback_data: 'gen_img_art' }
                                ],
                                [
                                    { text: '🏢 Логотип', callback_data: 'gen_img_logo' },
                                    { text: '😸 Аватарка', callback_data: 'gen_img_avatar' }
                                ],
                                [
                                    { text: '🌅 Пейзаж', callback_data: 'gen_img_landscape' },
                                    { text: '🎭 Абстракция', callback_data: 'gen_img_abstract' }
                                ],
                                [
                                    { text: '🔙 Назад в меню', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_generate_video':
                    await ctx.editMessageText('🎬🎥 ГЕНЕРАЦИЯ ВИДЕО 🎥🎬\n\n' +
                        '⚠️ ЭКСПЕРИМЕНТАЛЬНАЯ ФУНКЦИЯ ⚠️\n\n' +
                        'Создание видео с помощью ИИ — это новая возможность которая работает в бета режиме!!\n\n' +
                        '⏱ Время генерации: от 2 до 10 минут\n' +
                        '📏 Длительность видео: до 15 секунд\n' +
                        '📐 Разрешение: 720p\n\n' +
                        '💎 Доступно только для PREMIUM и VIP подписчиков!!!', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🎬 Создать видео', callback_data: 'gen_video_start' },
                                    { text: '📋 Примеры', callback_data: 'gen_video_examples' }
                                ],
                                [
                                    { text: '💎 Купить Premium', callback_data: 'menu_subscription' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_settings':
                    await ctx.editMessageText('⚙️🔧 НАСТРОЙКИ ⚙️🔧\n\n' +
                        'Настрой бота под себя!!! Здесь можно изменить параметры генерации текста и изображений.\n\n' +
                        '📌 Текущие настройки:\n' +
                        '🤖 Модель: GPT-4 Turbo\n' +
                        '🌡 Температура: 0.7 (средняя креативность)\n' +
                        '📏 Макс. длина: 2000 токенов\n' +
                        '🌐 Язык: Русский\n' +
                        '🎨 Стиль картинок: Реалистичный', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🤖 Сменить модель', callback_data: 'settings_model' },
                                    { text: '🌡 Температура', callback_data: 'settings_temperature' }
                                ],
                                [
                                    { text: '📏 Длина ответа', callback_data: 'settings_length' },
                                    { text: '🎨 Стиль картинок', callback_data: 'settings_image_style' }
                                ],
                                [
                                    { text: '🔄 Сбросить настройки', callback_data: 'settings_reset' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_subscription':
                    await ctx.editMessageText('💎💰 ПОДПИСКИ И ТАРИФЫ 💰💎\n\n' +
                        'Выбери подходящий тарифный план!!!\n\n' +
                        '🆓 FREE — БЕСПЛАТНО\n' +
                        '   • 5 текстовых запросов в день\n' +
                        '   • 2 картинки в день\n' +
                        '   • Без видео генерации\n\n' +
                        '⭐️ STANDARD — 299₽/мес\n' +
                        '   • 100 текстовых запросов в день\n' +
                        '   • 20 картинок в день\n' +
                        '   • 5 видео в день\n\n' +
                        '💫 PREMIUM — 699₽/мес\n' +
                        '   • 500 запросов в день\n' +
                        '   • 50 картинок + приоритет\n' +
                        '   • 20 видео в день\n\n' +
                        '👑 VIP — 1499₽/мес\n' +
                        '   • БЕЗЛИМИТ НА ВСЁ!!!\n' +
                        '   • Эксклюзивные модели\n' +
                        '   • Персональная поддержка', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '⭐️ Купить Standard', callback_data: 'buy_standard' },
                                    { text: '💫 Купить Premium', callback_data: 'buy_premium' }
                                ],
                                [
                                    { text: '👑 Купить VIP', callback_data: 'buy_vip' }
                                ],
                                [
                                    { text: '🪙 Оплата криптой', callback_data: 'buy_crypto' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_profile':
                    // Загружаем данные пользователя из БД для отображения профиля
                    const queries = require('../database/queries');
                    let userData = null;
                    try {
                        userData = await queries.getUser(userId);
                    } catch (dbErr) {
                        console.log('не удалось загрузить профиль из базы: ' + dbErr);
                    }

                    const profileName = userData ? userData.username : (ctx.from.username || 'неизвестно');
                    const profileSub = userData ? userData.subscription : 'FREE';
                    const profileRequests = userData ? userData.requests_today : '???';

                    await ctx.editMessageText('👤📋 МОЙ ПРОФИЛЬ 📋👤\n\n' +
                        '🆔 ID: ' + userId + '\n' +
                        '👤 Юзернейм: @' + profileName + '\n' +
                        '💎 Подписка: ' + profileSub + '\n' +
                        '📊 Запросов сегодня: ' + profileRequests + '\n' +
                        '📅 Дата регистрации: загрузка...\n' +
                        '🎁 Реферальный код: LX' + userId + '\n\n' +
                        '💡 Пригласи друзей по своему реферальному коду и получи бонусные запросы!!!', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📊 Подробная статистика', callback_data: 'menu_stats' },
                                    { text: '💎 Изменить подписку', callback_data: 'menu_subscription' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_stats':
                    await ctx.editMessageText('📊📈 СТАТИСТИКА ИСПОЛЬЗОВАНИЯ 📈📊\n\n' +
                        '📝 Текстовых генераций: загрузка...\n' +
                        '🖼 Картинок создано: загрузка...\n' +
                        '🎬 Видео создано: загрузка...\n\n' +
                        '📅 За сегодня: загрузка...\n' +
                        '📅 За неделю: загрузка...\n' +
                        '📅 За месяц: загрузка...\n' +
                        '📅 За всё время: загрузка...\n\n' +
                        '⏳ Данные загружаются подождите...', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🔄 Обновить', callback_data: 'menu_stats' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_help':
                    // Перенаправляем на справку через editMessage, т.к. мы внутри callback query
                    await ctx.editMessageText('❓ Для получения полной справки используй команду /help\n\n' +
                        'Или выбери раздел помощи:', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📋 Список команд', callback_data: 'help_commands' },
                                    { text: '❓ FAQ', callback_data: 'help_faq' }
                                ],
                                [
                                    { text: '💬 Написать в поддержку', url: 'https://t.me/lawx_support' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_referral':
                    await ctx.editMessageText('💰🤝 РЕФЕРАЛЬНАЯ ПРОГРАММА 🤝💰\n\n' +
                        'Приглашай друзей и получай БЕСПЛАТНЫЕ запросы!!!\n\n' +
                        '🔗 Твоя реферальная ссылка:\n' +
                        'https://t.me/lawx_bot?start=ref_' + userId + '\n\n' +
                        '🎁 За каждого друга: +10 запросов\n' +
                        '🏆 Топ-10 рефереров: БЕСПЛАТНАЯ подписка!!\n\n' +
                        '👥 Приглашено друзей: загрузка...\n' +
                        '🎁 Получено бонусов: загрузка...', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📤 Поделиться ссылкой', callback_data: 'referral_share' },
                                    { text: '📊 Мои рефералы', callback_data: 'referral_list' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_language':
                    await ctx.editMessageText('🌐🗣 ВЫБОР ЯЗЫКА 🗣🌐\n\n' +
                        'Выбери язык интерфейса бота!\n' +
                        'Choose bot interface language!\n\n' +
                        '📌 Текущий язык: 🇷🇺 Русский', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
                                    { text: '🇬🇧 English', callback_data: 'lang_en' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_history':
                    await ctx.editMessageText('📋📂 ИСТОРИЯ ГЕНЕРАЦИЙ 📂📋\n\n' +
                        '⏳ Загрузка истории...\n\n' +
                        'Здесь будут отображаться последние 20 генераций.\n' +
                        'Ты можешь повторить любую из них нажав на неё!\n\n' +
                        '📝 Текстовых: загрузка...\n' +
                        '🖼 Картинок: загрузка...\n' +
                        '🎬 Видео: загрузка...', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📝 Тексты', callback_data: 'history_text' },
                                    { text: '🖼 Картинки', callback_data: 'history_images' }
                                ],
                                [
                                    { text: '🎬 Видео', callback_data: 'history_video' },
                                    { text: '🗑 Очистить историю', callback_data: 'history_clear' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_promo':
                    await ctx.editMessageText('🎁🎉 ПРОМОКОДЫ 🎉🎁\n\n' +
                        'Введи промокод чтобы получить бонусы!!!\n\n' +
                        'Просто отправь промокод в чат и бот автоматически его активирует!\n\n' +
                        '💡 Где взять промокоды:\n' +
                        '• В нашем канале @lawx_channel\n' +
                        '• У партнёров и блогеров\n' +
                        '• В рассылках по email\n' +
                        '• За участие в конкурсах', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📢 Канал с промокодами', url: 'https://t.me/lawx_channel' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_rate':
                    await ctx.editMessageText('⭐️🌟 ОЦЕНИТЬ БОТА 🌟⭐️\n\n' +
                        'Нам очень важна твоя обратная связь!!!\n' +
                        'Поставь оценку боту от 1 до 5 звёзд:\n\n' +
                        '(Твоя оценка поможет нам стать лучше! 💪)', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '⭐️', callback_data: 'rate_1' },
                                    { text: '⭐️⭐️', callback_data: 'rate_2' },
                                    { text: '⭐️⭐️⭐️', callback_data: 'rate_3' },
                                    { text: '⭐️⭐️⭐️⭐️', callback_data: 'rate_4' },
                                    { text: '⭐️⭐️⭐️⭐️⭐️', callback_data: 'rate_5' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_support':
                    await ctx.editMessageText('📞💬 ПОДДЕРЖКА 💬📞\n\n' +
                        'Если у тебя возникли проблемы или вопросы — мы поможем!!!\n\n' +
                        '📧 Email: support@lawx.ru\n' +
                        '💬 Чат: @lawx_chat\n' +
                        '👨‍💻 Разработчик: @lawx_developer\n\n' +
                        '⏰ Время ответа: от 5 минут до 24 часов\n' +
                        '(зависит от загруженности и времени суток)', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '💬 Написать в поддержку', url: 'https://t.me/lawx_support' }
                                ],
                                [
                                    { text: '🐛 Сообщить о баге', callback_data: 'support_bug' },
                                    { text: '💡 Предложить идею', callback_data: 'support_idea' }
                                ],
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'menu_notifications':
                    await ctx.editMessageText('🔔📣 УВЕДОМЛЕНИЯ 📣🔔\n\n' +
                        'Настрой какие уведомления ты хочешь получать:\n\n' +
                        '📌 Текущие настройки:\n' +
                        '✅ Новости и обновления\n' +
                        '✅ Промокоды и акции\n' +
                        '✅ Напоминания о лимитах\n' +
                        '❌ Ежедневная рассылка', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📰 Новости: ВКЛ', callback_data: 'notif_toggle_news' },
                                    { text: '🎁 Акции: ВКЛ', callback_data: 'notif_toggle_promo' }
                                ],
                                [
                                    { text: '⚠️ Лимиты: ВКЛ', callback_data: 'notif_toggle_limits' },
                                    { text: '📧 Рассылка: ВЫКЛ', callback_data: 'notif_toggle_daily' }
                                ],
                                [
                                    { text: '🔕 Отключить все', callback_data: 'notif_disable_all' },
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'donate_menu':
                    await ctx.editMessageText('💰🙏 ПОДДЕРЖАТЬ ПРОЕКТ 🙏💰\n\n' +
                        'Если тебе нравится бот — ты можешь поддержать разработку!!!\n\n' +
                        'Любая сумма помогает нам делать бот лучше и добавлять новые функции!\n\n' +
                        '💳 Карта: 2200 7007 8765 4321\n' +
                        '🪙 USDT (TRC20): TXqZ...abc123\n' +
                        '🪙 TON: UQBx...xyz789\n\n' +
                        'СПАСИБО ЗА ПОДДЕРЖКУ!!! ❤️❤️❤️', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🔙 Назад', callback_data: 'back_to_main_menu' }
                                ]
                            ]
                        }
                    });
                    break;

                case 'back_to_main_menu':
                    // Возвращаемся в главное меню, перерисовываем полную клавиатуру навигации
                    await ctx.editMessageText('🏠 ГЛАВНОЕ МЕНЮ lawX 🏠\n\nВыбери что тебе нужно из списка ниже!! 👇👇', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🔤 Генерация текста', callback_data: 'menu_generate_text' },
                                    { text: '🎨 Генерация картинок', callback_data: 'menu_generate_image' }
                                ],
                                [
                                    { text: '🎬 Генерация видео', callback_data: 'menu_generate_video' },
                                    { text: '⚙️ Настройки', callback_data: 'menu_settings' }
                                ],
                                [
                                    { text: '💎 Подписка', callback_data: 'menu_subscription' },
                                    { text: '👤 Мой профиль', callback_data: 'menu_profile' }
                                ],
                                [
                                    { text: '📊 Статистика', callback_data: 'menu_stats' },
                                    { text: '❓ Помощь', callback_data: 'menu_help' }
                                ],
                                [
                                    { text: '💰 Реферальная программа', callback_data: 'menu_referral' },
                                    { text: '🌐 Сменить язык', callback_data: 'menu_language' }
                                ],
                                [
                                    { text: '📋 История генераций', callback_data: 'menu_history' },
                                    { text: '🎁 Промокод', callback_data: 'menu_promo' }
                                ],
                                [
                                    { text: '⭐️ Оценить бота', callback_data: 'menu_rate' },
                                    { text: '📞 Поддержка', callback_data: 'menu_support' }
                                ],
                                [
                                    { text: '🔔 Уведомления', callback_data: 'menu_notifications' }
                                ]
                            ]
                        }
                    });
                    break;

                // Обработка вспомогательных callback: список команд, FAQ и прочие подразделы
                case 'help_commands':
                    await ctx.editMessageText('📋 СПИСОК КОМАНД:\n\n' +
                        '/start — Запуск бота\n' +
                        '/help — Помощь\n' +
                        '/menu — Главное меню\n' +
                        '/generate — Генерация текста\n' +
                        '/image — Генерация картинок\n' +
                        '/video — Генерация видео\n' +
                        '/settings — Настройки\n' +
                        '/profile — Профиль\n' +
                        '/subscribe — Подписка\n' +
                        '/referral — Рефералка\n' +
                        '/stats — Статистика\n' +
                        '/lang — Язык', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔙 Назад', callback_data: 'menu_help' }]
                            ]
                        }
                    });
                    break;

                case 'help_faq':
                    await ctx.editMessageText('❓ FAQ — Часто задаваемые вопросы:\n\n' +
                        'В: Бот не отвечает?\n' +
                        'О: Закончились запросы или сервер перегружен\n\n' +
                        'В: Как купить подписку?\n' +
                        'О: /subscribe или кнопка Подписка в меню\n\n' +
                        'В: Можно вернуть деньги?\n' +
                        'О: Нет возвратов к сожалению\n\n' +
                        'В: Бот безопасный?\n' +
                        'О: Да мы не храним ваши данные (почти)', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔙 Назад', callback_data: 'menu_help' }]
                            ]
                        }
                    });
                    break;

                default:
                    // Default-ветка для ещё не реализованных разделов. Показываем заглушку
                    console.log('необработанный callback: ' + callbackData);
                    await ctx.editMessageText('🚧 Этот раздел находится в разработке!!! 🚧\n\n' +
                        'Мы усердно работаем чтобы добавить эту функцию как можно скорее!!\n' +
                        'Следи за обновлениями в нашем канале @lawx_channel! 📢', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔙 Назад в меню', callback_data: 'back_to_main_menu' }]
                            ]
                        }
                    });
                    break;
            }

        } catch (e) {
            console.log('ошибка обработки callback query: ' + e);
            try {
                await ctx.reply('😥 Произошла ошибка. Попробуй ещё раз или напиши /menu');
            } catch (e2) {
                console.log('ошибка отправки сообщения об ошибке в меню: ' + e2);
            }
        }
    });
};

module.exports = menuHandler;
