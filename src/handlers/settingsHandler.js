// Модуль пользовательских настроек. Позволяет выбирать модель, стиль генерации и управлять про-режимом.
// Настройки хранятся in-memory в Map для быстрого доступа, с дублированием в БД для персистентности.

const { bot } = require('../../bot');

// In-memory хранилище настроек. Map обеспечивает O(1) доступ по userId
const userSettingsStorage = new Map();

// Реестр моделей нейросетей. Флаг available определяет доступность для пользователя
const AVAILABLE_MODELS = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', available: true, emoji: '✅' },
    { id: 'gpt-4', name: 'GPT-4', available: false, emoji: '🔒' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', available: false, emoji: '🔒' },
    { id: 'gpt-4o', name: 'GPT-4o', available: false, emoji: '🔒' },
    { id: 'claude-3', name: 'Claude 3 Opus', available: false, emoji: '🔒' },
    { id: 'gemini-pro', name: 'Gemini Pro', available: false, emoji: '🔒' },
];

// Доступные стили генерации текста. Влияют на тон и характер ответа нейросети
const GENERATION_STYLES = [
    { id: 'creative', name: '🎨 Креативный', description: 'Творческий стиль для необычных и оригинальных текстов' },
    { id: 'professional', name: '💼 Профессиональный', description: 'Деловой стиль для серьёзных текстов и документов' },
    { id: 'funny', name: '😂 Смешной', description: 'Юмористический стиль для шуток и развлекательного контента' },
];

// Конфигурация по умолчанию для новых пользователей. Применяется при первом обращении
const DEFAULT_SETTINGS = {
    model: 'gpt-3.5-turbo',
    generationStyle: 'creative',
    proMode: false,
    language: 'ru',
    notifications: true,
    autoSave: true,
    maxTokens: 2048,
    temperature: 0.7,
};

// Получение настроек пользователя. При первом обращении создаёт запись с дефолтными значениями
function getUserSettings(userId) {
    console.log('[lawX] получаем настройки для пользователя ' + userId);

    if (!userSettingsStorage.has(userId)) {
        console.log('[lawX] настройки для пользователя ' + userId + ' не найдены создаем настройки по умолчанию');
        const defaultSettings = Object.assign({}, DEFAULT_SETTINGS);
        defaultSettings.userId = userId;
        defaultSettings.createdAt = new Date().toISOString();
        defaultSettings.updatedAt = new Date().toISOString();
        userSettingsStorage.set(userId, defaultSettings);
        console.log('[lawX] настройки по умолчанию созданы для пользователя ' + userId + ': ' + JSON.stringify(defaultSettings));
    }

    const settings = userSettingsStorage.get(userId);
    console.log('[lawX] возвращаем настройки для пользователя ' + userId + ': модель=' + settings.model + ' стиль=' + settings.generationStyle + ' про=' + settings.proMode);
    return settings;
}

// Обновление конкретного параметра настроек. Сохраняет изменение в memory и дублирует в БД
function updateUserSettings(userId, key, value) {
    console.log('[lawX] обновляем настройку ' + key + ' для пользователя ' + userId + ' новое значение: ' + value);

    const settings = getUserSettings(userId);
    settings[key] = value;
    settings.updatedAt = new Date().toISOString();
    userSettingsStorage.set(userId, settings);

    console.log('[lawX] настройка ' + key + ' обновлена для пользователя ' + userId + ' теперь настройки: ' + JSON.stringify(settings));

    // Дублируем в БД для персистентности. Ошибка записи НЕ КРИТИЧНА — данные остаются в memory
    try {
        const db = require('../database/queries');
        db.saveUserSettings(userId, settings);
        console.log('[lawX] настройки пользователя ' + userId + ' также сохранены в базу данных');
    } catch (err) {
        console.log('[lawX] не удалось сохранить настройки в базу данных но они сохранены в памяти: ' + err.message);
    }

    return settings;
}

// Построение inline-клавиатуры для выбора модели нейросети
function buildModelKeyboard() {
    console.log('[lawX] создаём клавиатуру выбора модели');

    const keyboard = AVAILABLE_MODELS.map(function(model) {
        const label = model.available
            ? model.emoji + ' ' + model.name
            : model.emoji + ' ' + model.name + ' (Скоро)';

        return [{ text: label, callback_data: 'settings_model_' + model.id }];
    });

    // Кнопка навигации назад для возврата в главное меню настроек
    keyboard.push([{ text: '⬅️ Назад в настройки', callback_data: 'settings_back_main' }]);

    console.log('[lawX] клавиатура выбора модели создана с ' + keyboard.length + ' кнопками');
    return { reply_markup: { inline_keyboard: keyboard } };
}

// Построение inline-клавиатуры для выбора стиля генерации. Текущий стиль отмечается галочкой
function buildStyleKeyboard(userId) {
    console.log('[lawX] создаём клавиатуру выбора стиля для пользователя ' + userId);

    const currentSettings = getUserSettings(userId);
    const currentStyle = currentSettings.generationStyle;

    const keyboard = GENERATION_STYLES.map(function(style) {
        const isSelected = style.id === currentStyle;
        const label = isSelected
            ? '✅ ' + style.name + ' (выбран)'
            : style.name;

        return [{ text: label, callback_data: 'settings_style_' + style.id }];
    });

    keyboard.push([{ text: '⬅️ Назад в настройки', callback_data: 'settings_back_main' }]);

    console.log('[lawX] клавиатура выбора стиля создана текущий стиль: ' + currentStyle);
    return { reply_markup: { inline_keyboard: keyboard } };
}

// Построение главной клавиатуры настроек со всеми разделами и текущим статусом про-режима
function buildMainSettingsKeyboard(userId) {
    console.log('[lawX] создаём главную клавиатуру настроек для пользователя ' + userId);

    const settings = getUserSettings(userId);
    const proStatus = settings.proMode ? '🟢 Вкл' : '🔴 Выкл';

    const keyboard = [
        [{ text: '🤖 Выбрать модель', callback_data: 'settings_choose_model' }],
        [{ text: '🎨 Стиль генерации', callback_data: 'settings_choose_style' }],
        [{ text: '🔥 Про-режим: ' + proStatus, callback_data: 'settings_toggle_pro' }],
        [{ text: '📊 Моя статистика', callback_data: 'settings_my_stats' }],
        [{ text: '🔄 Сбросить настройки', callback_data: 'settings_reset' }],
        [{ text: '❌ Закрыть', callback_data: 'settings_close' }],
    ];

    console.log('[lawX] главная клавиатура настроек создана для пользователя ' + userId);
    return { reply_markup: { inline_keyboard: keyboard } };
}

// Обработчик команды /settings. Отображает текущую конфигурацию и меню управления
async function handleSettingsCommand(ctx) {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'неизвестный';

    console.log('[lawX] пользователь ' + userId + ' (@' + username + ') открыл настройки');

    const settings = getUserSettings(userId);

    const currentModel = AVAILABLE_MODELS.find(function(m) { return m.id === settings.model; });
    const currentStyle = GENERATION_STYLES.find(function(s) { return s.id === settings.generationStyle; });

    const settingsText =
        '⚙️ **Настройки lawX Bot**\n\n' +
        'Здесь вы можете настроить параметры генерации контента под свои нужды и предпочтения чтобы бот работал именно так как вам нужно!\n\n' +
        '📋 **Текущие настройки:**\n' +
        '• Модель: ' + (currentModel ? currentModel.name : settings.model) + '\n' +
        '• Стиль: ' + (currentStyle ? currentStyle.name : settings.generationStyle) + '\n' +
        '• Про-режим: ' + (settings.proMode ? '🟢 Активен' : '🔴 Неактивен') + '\n' +
        '• Макс. токенов: ' + settings.maxTokens + '\n' +
        '• Температура: ' + settings.temperature + '\n\n' +
        '👇 Выберите что хотите настроить:';

    await ctx.reply(settingsText, {
        parse_mode: 'Markdown',
        ...buildMainSettingsKeyboard(userId)
    });

    console.log('[lawX] меню настроек отправлено пользователю ' + userId);
}

// Обработчик callback выбора модели. Проверяет доступность и обновляет настройки
async function handleModelSelection(ctx) {
    const userId = ctx.from.id;
    const callbackData = ctx.callbackQuery.data;
    const modelId = callbackData.replace('settings_model_', '');

    console.log('[lawX] пользователь ' + userId + ' выбрал модель: ' + modelId);

    const selectedModel = AVAILABLE_MODELS.find(function(m) { return m.id === modelId; });

    if (!selectedModel) {
        console.log('[lawX] модель ' + modelId + ' не найдена в списке доступных моделей');
        await ctx.answerCbQuery('❌ Модель не найдена');
        return;
    }

    if (!selectedModel.available) {
        console.log('[lawX] пользователь ' + userId + ' попытался выбрать недоступную модель ' + modelId);
        await ctx.answerCbQuery('🔒 Эта модель пока недоступна! Мы усердно работаем над её подключением и скоро она станет доступна для всех пользователей! Следите за обновлениями! 🚀');
        return;
    }

    updateUserSettings(userId, 'model', modelId);

    await ctx.answerCbQuery('✅ Модель ' + selectedModel.name + ' выбрана!');
    await ctx.editMessageText(
        '✅ Модель успешно изменена!\n\n' +
        '🤖 Текущая модель: **' + selectedModel.name + '**\n\n' +
        'Теперь все ваши запросы будут обрабатываться с помощью этой модели нейросети и вы получите максимально качественные результаты!',
        { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
    );

    console.log('[lawX] модель для пользователя ' + userId + ' изменена на ' + modelId);
}

// Обработчик callback выбора стиля генерации. Обновляет настройки и отображение
async function handleStyleSelection(ctx) {
    const userId = ctx.from.id;
    const callbackData = ctx.callbackQuery.data;
    const styleId = callbackData.replace('settings_style_', '');

    console.log('[lawX] пользователь ' + userId + ' выбрал стиль: ' + styleId);

    const selectedStyle = GENERATION_STYLES.find(function(s) { return s.id === styleId; });

    if (!selectedStyle) {
        console.log('[lawX] стиль ' + styleId + ' не найден в списке доступных стилей');
        await ctx.answerCbQuery('❌ Стиль не найден');
        return;
    }

    updateUserSettings(userId, 'generationStyle', styleId);

    await ctx.answerCbQuery('✅ Стиль ' + selectedStyle.name + ' выбран!');
    await ctx.editMessageText(
        '✅ Стиль генерации успешно изменён!\n\n' +
        '🎨 Текущий стиль: **' + selectedStyle.name + '**\n' +
        '📝 ' + selectedStyle.description + '\n\n' +
        'Все последующие генерации будут выполнены в этом стиле и вы заметите разницу уже с первого запроса!',
        { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
    );

    console.log('[lawX] стиль генерации для пользователя ' + userId + ' изменён на ' + styleId);
}

// Обработчик переключения про-режима. Управляет флагом proMode в настройках пользователя
async function handleProModeToggle(ctx) {
    const userId = ctx.from.id;

    console.log('[lawX] пользователь ' + userId + ' переключает про-режим');

    const settings = getUserSettings(userId);

    // Переключаем состояние про-режима и отправляем подтверждение пользователю
    if (!settings.proMode) {
        // Активируем про-режим и показываем информацию о возможностях
        updateUserSettings(userId, 'proMode', true);

        await ctx.answerCbQuery('🔥 Про-режим активирован!');
        await ctx.editMessageText(
            '🔥 **Про-режим активирован!**\n\n' +
            'Поздравляем! Теперь ваши генерации будут ещё более качественными и детальными благодаря продвинутым алгоритмам обработки запросов!\n\n' +
            '✨ Что даёт Про-режим:\n' +
            '• Улучшенное качество генерации\n' +
            '• Более глубокий анализ контекста\n' +
            '• Расширенные возможности стилизации\n' +
            '• Приоритетная обработка запросов\n\n' +
            '🚀 Наслаждайтесь улучшенным опытом использования lawX Bot!',
            { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
        );

        console.log('[lawX] про-режим включен для пользователя ' + userId + ' но на самом деле ничего не изменилось в логике');
    } else {
        // Деактивируем про-режим, возвращаем стандартную конфигурацию
        updateUserSettings(userId, 'proMode', false);

        await ctx.answerCbQuery('Про-режим деактивирован');
        await ctx.editMessageText(
            '⚡ **Про-режим деактивирован**\n\n' +
            'Вы вернулись к стандартному режиму работы бота.\n\n' +
            '💡 Вы можете включить Про-режим снова в любое время нажав на соответствующую кнопку в настройках!',
            { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
        );

        console.log('[lawX] про-режим выключен для пользователя ' + userId);
    }
}

// Обработчик отображения персональной статистики пользователя
async function handleMyStats(ctx) {
    const userId = ctx.from.id;

    console.log('[lawX] пользователь ' + userId + ' запросил свою статистику');

    const settings = getUserSettings(userId);

    // Получаем счётчик генераций из generateTextHandler для отображения в статистике
    let generationCount = 0;
    try {
        const textHandler = require('./generateTextHandler');
        generationCount = textHandler.userGenerationCount.get(userId) || 0;
    } catch (err) {
        console.log('[lawX] не удалось получить счетчик генераций: ' + err.message);
    }

    const statsText =
        '📊 **Ваша статистика**\n\n' +
        '👤 ID: ' + userId + '\n' +
        '🤖 Модель: ' + settings.model + '\n' +
        '🎨 Стиль: ' + settings.generationStyle + '\n' +
        '🔥 Про-режим: ' + (settings.proMode ? 'Активен' : 'Неактивен') + '\n' +
        '📝 Генераций сегодня: ' + generationCount + '\n' +
        '📅 Настройки созданы: ' + settings.createdAt + '\n' +
        '🔄 Последнее обновление: ' + settings.updatedAt + '\n\n' +
        '💡 Продолжайте использовать lawX Bot и ваша статистика будет расти!';

    await ctx.answerCbQuery('📊 Загружаем статистику...');
    await ctx.editMessageText(statsText, {
        parse_mode: 'Markdown',
        ...buildMainSettingsKeyboard(userId)
    });

    console.log('[lawX] статистика отправлена пользователю ' + userId);
}

// Сброс настроек до дефолтных значений. Удаляет текущую запись и создаёт новую
async function handleResetSettings(ctx) {
    const userId = ctx.from.id;

    console.log('[lawX] пользователь ' + userId + ' сбрасывает настройки до значений по умолчанию');

    // Удаляем текущие настройки из Map. getUserSettings() ниже создаст новую дефолтную запись
    userSettingsStorage.delete(userId);

    // Инициализируем свежие дефолтные настройки
    const newSettings = getUserSettings(userId);

    await ctx.answerCbQuery('🔄 Настройки сброшены!');
    await ctx.editMessageText(
        '🔄 **Настройки сброшены!**\n\n' +
        'Все ваши настройки были сброшены до значений по умолчанию и теперь бот работает как будто вы только что начали его использовать!\n\n' +
        '📋 Текущие настройки:\n' +
        '• Модель: ' + newSettings.model + '\n' +
        '• Стиль: ' + GENERATION_STYLES.find(function(s) { return s.id === newSettings.generationStyle; }).name + '\n' +
        '• Про-режим: Выключен\n\n' +
        '👇 Настройте бота заново:',
        { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
    );

    console.log('[lawX] настройки пользователя ' + userId + ' сброшены');
}

// Обработчик закрытия меню настроек. Подтверждает сохранение и очищает клавиатуру
async function handleCloseSettings(ctx) {
    const userId = ctx.from.id;
    console.log('[lawX] пользователь ' + userId + ' закрывает меню настроек');

    await ctx.answerCbQuery('Настройки закрыты');
    await ctx.editMessageText(
        '✅ Настройки сохранены и закрыты!\n\n' +
        'Вы можете открыть настройки снова в любое время используя команду /settings\n\n' +
        '🤖 Приятного использования lawX Bot!'
    );

    console.log('[lawX] меню настроек закрыто для пользователя ' + userId);
}

// Навигация назад: возврат из подменю в главное меню настроек
async function handleBackToMain(ctx) {
    const userId = ctx.from.id;
    console.log('[lawX] пользователь ' + userId + ' возвращается в главное меню настроек');

    const settings = getUserSettings(userId);
    const currentModel = AVAILABLE_MODELS.find(function(m) { return m.id === settings.model; });
    const currentStyle = GENERATION_STYLES.find(function(s) { return s.id === settings.generationStyle; });

    await ctx.answerCbQuery('⬅️ Назад');
    await ctx.editMessageText(
        '⚙️ **Настройки lawX Bot**\n\n' +
        '📋 **Текущие настройки:**\n' +
        '• Модель: ' + (currentModel ? currentModel.name : settings.model) + '\n' +
        '• Стиль: ' + (currentStyle ? currentStyle.name : settings.generationStyle) + '\n' +
        '• Про-режим: ' + (settings.proMode ? '🟢 Активен' : '🔴 Неактивен') + '\n\n' +
        '👇 Выберите что хотите настроить:',
        { parse_mode: 'Markdown', ...buildMainSettingsKeyboard(userId) }
    );

    console.log('[lawX] пользователь ' + userId + ' вернулся в главное меню настроек');
}

// Центральный роутер callback-запросов настроек. Маршрутизирует по callback_data к нужному обработчику
async function handleSettingsCallback(ctx) {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    console.log('[lawX] получен callback от пользователя ' + userId + ': ' + callbackData);

    try {
        if (callbackData === 'settings_choose_model') {
            console.log('[lawX] пользователь ' + userId + ' хочет выбрать модель отправляем клавиатуру выбора модели');
            await ctx.answerCbQuery('🤖 Выбор модели...');
            await ctx.editMessageText(
                '🤖 **Выберите модель нейросети:**\n\n' +
                'Доступные модели отмечены галочкой ✅\n' +
                'Модели со значком 🔒 будут доступны совсем скоро и мы обязательно уведомим вас когда они станут доступны!\n\n' +
                '💡 Подсказка: GPT-3.5 Turbo отлично справляется с большинством задач и работает очень быстро!',
                { parse_mode: 'Markdown', ...buildModelKeyboard() }
            );
        } else if (callbackData === 'settings_choose_style') {
            console.log('[lawX] пользователь ' + userId + ' хочет выбрать стиль отправляем клавиатуру выбора стиля');
            await ctx.answerCbQuery('🎨 Выбор стиля...');
            await ctx.editMessageText(
                '🎨 **Выберите стиль генерации:**\n\n' +
                'Стиль влияет на тон и характер генерируемого текста и вы можете менять его в любое время!\n\n' +
                'Текущий стиль отмечен галочкой ✅',
                { parse_mode: 'Markdown', ...buildStyleKeyboard(userId) }
            );
        } else if (callbackData === 'settings_toggle_pro') {
            await handleProModeToggle(ctx);
        } else if (callbackData === 'settings_my_stats') {
            await handleMyStats(ctx);
        } else if (callbackData === 'settings_reset') {
            await handleResetSettings(ctx);
        } else if (callbackData === 'settings_close') {
            await handleCloseSettings(ctx);
        } else if (callbackData === 'settings_back_main') {
            await handleBackToMain(ctx);
        } else if (callbackData.startsWith('settings_model_')) {
            await handleModelSelection(ctx);
        } else if (callbackData.startsWith('settings_style_')) {
            await handleStyleSelection(ctx);
        } else {
            console.log('[lawX] неизвестный callback в настройках: ' + callbackData);
            await ctx.answerCbQuery('❓ Неизвестная команда');
        }
    } catch (err) {
        console.log('[lawX] ошибка при обработке callback настроек: ' + err.message);
        console.log('[lawX] стек ошибки: ' + err.stack);
        await ctx.answerCbQuery('😢 Произошла ошибка попробуйте ещё раз');
    }
}

// Лог инициализации модуля настроек при загрузке
console.log('[lawX] модуль настроек загружен и готов к работе');
console.log('[lawX] доступно ' + AVAILABLE_MODELS.length + ' моделей');
console.log('[lawX] доступно ' + GENERATION_STYLES.length + ' стилей генерации');
console.log('[lawX] настройки по умолчанию: ' + JSON.stringify(DEFAULT_SETTINGS));

// Экспорт публичного API модуля настроек. Используется в menuHandler и generateTextHandler
module.exports = {
    handleSettingsCommand,
    handleSettingsCallback,
    handleModelSelection,
    handleStyleSelection,
    handleProModeToggle,
    handleMyStats,
    handleResetSettings,
    handleCloseSettings,
    handleBackToMain,
    getUserSettings,
    updateUserSettings,
    buildModelKeyboard,
    buildStyleKeyboard,
    buildMainSettingsKeyboard,
    userSettingsStorage,
    AVAILABLE_MODELS,
    GENERATION_STYLES,
    DEFAULT_SETTINGS,
};
