// Обработчик генерации изображений через DALL-E API.
// Принимает текстовое описание от пользователя и возвращает сгенерированную картинку.
// Прогресс-бар генерации реализован через editMessageText для ОБРАТНОЙ СВЯЗИ с пользователем.

const request = require('request');
const fs = require('fs');
const path = require('path');
const { bot, telegramBot } = require('../../bot');
const dalleClient = require('../api/dalle/dalleClient');

// Размер генерируемого изображения. Оптимален для отображения в Telegram
const IMAGE_SIZE = '256x256';

// Ограничение длины промпта. DALL-E лучше работает с лаконичными описаниями
const MAX_PROMPT_LENGTH = 500;

// Минимальная длина промпта для обеспечения осмысленного результата генерации
const MIN_PROMPT_LENGTH = 3;

// Директория для временного хранения скачанных изображений перед отправкой
const TEMP_DIR = '/tmp/';

// Стадии прогресс-бара. Обновляются каждую секунду для визуальной обратной связи
const progressStages = [
    '🎨 [░░░░░░░░░░] 0% начинаю генерацию...',
    '🎨 [▓░░░░░░░░░] 10% подключаюсь к серверу DALL-E...',
    '🎨 [▓▓░░░░░░░░] 20% отправляю промпт нейросети...',
    '🎨 [▓▓▓░░░░░░░] 30% нейросеть думает над картинкой...',
    '🎨 [▓▓▓▓░░░░░░] 40% нейросеть рисует первые контуры...',
    '🎨 [▓▓▓▓▓░░░░░] 50% добавляю цвета и текстуры...',
    '🎨 [▓▓▓▓▓▓░░░░] 60% прорабатываю детали изображения...',
    '🎨 [▓▓▓▓▓▓▓░░░] 70% финальная обработка картинки...',
    '🎨 [▓▓▓▓▓▓▓▓░░] 80% применяю фильтры и улучшения...',
    '🎨 [▓▓▓▓▓▓▓▓▓░] 90% почти готово осталось чуть-чуть...',
    '🎨 [▓▓▓▓▓▓▓▓▓▓] 100% картинка готова! ✨',
];

// Глобальный счётчик сгенерированных изображений за текущую сессию
let totalImagesGenerated = 0;

// Лог инициализации модуля генерации изображений
console.log('[lawX] модуль генерации картинок загружен и готов к работе');
console.log('[lawX] размер картинок установлен на: ' + IMAGE_SIZE);
console.log('[lawX] временная директория для скачивания: ' + TEMP_DIR);

// Валидация промпта перед отправкой в DALL-E. Проверяет длину и наличие текста
function validatePrompt(prompt) {
    // Проверка на пустой промпт
    if (!prompt) {
        return { valid: false, reason: 'промпт пустой' };
    }
    // Проверка минимальной длины
    if (prompt.length < MIN_PROMPT_LENGTH) {
        return { valid: false, reason: 'промпт слишком короткий минимум ' + MIN_PROMPT_LENGTH + ' символа' };
    }
    // Проверка максимальной длины
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return { valid: false, reason: 'промпт слишком длинный максимум ' + MAX_PROMPT_LENGTH + ' символов' };
    }
    // Все проверки пройдены — промпт валиден
    return { valid: true, reason: 'промпт валидный' };
}

// Генерация уникального имени файла для предотвращения коллизий при параллельных запросах
function generateFileName(userId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const fileName = 'lawx_image_' + userId + '_' + timestamp + '_' + random + '.png';
    console.log('[lawX] сгенерировано имя файла для картинки: ' + fileName);
    return fileName;
}

// Скачивание изображения по URL и сохранение во временный файл. Использует callback-стиль
function downloadImage(url, filePath, callback) {
    console.log('[lawX] начинаю скачивание картинки по url: ' + url);
    console.log('[lawX] сохраняю картинку в файл: ' + filePath);

    // Выполняем HTTP-запрос с binary-кодировкой для корректного скачивания изображения
    request({ url: url, encoding: null }, function(error, response, body) {
        if (error) {
            console.log('[lawX] ошибка при скачивании картинки: ' + error.message);
            callback(error, null);
            return;
        }

        // Валидация HTTP-статуса ответа
        if (response.statusCode !== 200) {
            console.log('[lawX] сервер вернул неожиданный статус код: ' + response.statusCode);
            callback(new Error('статус код ' + response.statusCode), null);
            return;
        }

        // Проверка наличия данных в теле ответа
        if (!body) {
            console.log('[lawX] тело ответа пустое картинка не скачалась');
            callback(new Error('пустое тело ответа'), null);
            return;
        }

        console.log('[lawX] картинка скачана размер: ' + body.length + ' байт');

        // Записываем изображение на диск
        fs.writeFile(filePath, body, function(writeError) {
            if (writeError) {
                console.log('[lawX] ошибка при записи файла на диск: ' + writeError.message);
                callback(writeError, null);
                return;
            }

            console.log('[lawX] файл успешно записан на диск: ' + filePath);
            callback(null, filePath);
        });
    });
}

// Главный обработчик команды генерации изображения. Координирует весь pipeline от промпта до отправки картинки
async function handleGenerateImage(ctx) {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const username = ctx.from.username || 'неизвестный';

    console.log('[lawX] пользователь ' + username + ' (id: ' + userId + ') запросил генерацию картинки');

    // Извлекаем промпт из сообщения, убирая префикс команды
    const messageText = ctx.message.text || '';
    const prompt = messageText.replace('/image', '').replace('/img', '').replace('/draw', '').replace('/рисуй', '').trim();

    console.log('[lawX] промпт от пользователя: ' + prompt);

    // Валидация промпта перед отправкой в API
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
        console.log('[lawX] промпт не прошел валидацию: ' + validation.reason);
        await ctx.reply('❌ Ошибка генерации изображения!\n\n' +
            '📝 ' + validation.reason + '\n\n' +
            '💡 Пожалуйста напишите описание картинки которую вы хотите сгенерировать например:\n' +
            '/image красивый закат на берегу моря с пальмами и чайками\n\n' +
            '🎨 Наш искусственный интеллект DALL-E нарисует для вас любую картинку по вашему описанию! ✨');
        return;
    }

    // Отправляем сообщение с прогресс-баром для визуальной обратной связи
    console.log('[lawX] отправляю начальное сообщение с прогрессбаром');
    const progressMessage = await ctx.reply('🎨 Рисую картинку с помощью нейросети DALL-E... ✨\n\n' +
        '📝 Ваш промпт: "' + prompt + '"\n' +
        '📐 Размер: ' + IMAGE_SIZE + '\n\n' +
        progressStages[0]);

    const progressMessageId = progressMessage.message_id;
    let currentStage = 0;

    // Запускаем интервал обновления прогресс-бара каждую секунду для UX
    console.log('[lawX] запускаю интервал обновления прогрессбара');
    const progressInterval = setInterval(async () => {
        currentStage++;
        if (currentStage >= progressStages.length - 1) {
            // Прогресс-бар завершён — останавливаем интервал обновления
            clearInterval(progressInterval);
            return;
        }

        try {
            // Обновляем текст сообщения с текущей стадией прогресса
            await ctx.telegram.editMessageText(
                chatId,
                progressMessageId,
                null,
                '🎨 Рисую картинку с помощью нейросети DALL-E... ✨\n\n' +
                '📝 Ваш промпт: "' + prompt + '"\n' +
                '📐 Размер: ' + IMAGE_SIZE + '\n\n' +
                progressStages[currentStage]
            );
            console.log('[lawX] прогрессбар обновлен до стадии ' + currentStage + ': ' + progressStages[currentStage]);
        } catch (editError) {
            // Ошибка обновления прогресса НЕ КРИТИЧНА — генерация продолжается
            console.log('[lawX] не удалось обновить прогрессбар: ' + editError.message);
            console.log('[lawX] это не критично продолжаем генерацию');
        }
    }, 1000);

    try {
        // Отправляем запрос в DALL-E API для генерации изображения
        console.log('[lawX] отправляю запрос в DALL-E API...');
        console.log('[lawX] параметры запроса: prompt=' + prompt + ' size=' + IMAGE_SIZE);

        const imageResult = await dalleClient.generateImage(prompt, IMAGE_SIZE);

        console.log('[lawX] DALL-E API вернул результат');
        console.log('[lawX] url картинки: ' + imageResult.url);

        // Останавливаем прогресс-бар после получения результата от API
        clearInterval(progressInterval);

        // Финальное обновление прогресс-бара до 100%
        try {
            await ctx.telegram.editMessageText(
                chatId,
                progressMessageId,
                null,
                '🎨 Рисую картинку с помощью нейросети DALL-E... ✨\n\n' +
                '📝 Ваш промпт: "' + prompt + '"\n' +
                '📐 Размер: ' + IMAGE_SIZE + '\n\n' +
                progressStages[progressStages.length - 1]
            );
        } catch (editError) {
            console.log('[lawX] не удалось обновить прогрессбар до 100%: ' + editError.message);
        }

        // Формируем уникальное имя и путь для временного файла
        const fileName = generateFileName(userId);
        const filePath = path.join(TEMP_DIR, fileName);

        console.log('[lawX] скачиваю картинку во временный файл: ' + filePath);

        // Скачиваем изображение. Оборачиваем callback в Promise для работы с async/await
        await new Promise((resolve, reject) => {
            downloadImage(imageResult.url, filePath, function(error, savedPath) {
                if (error) {
                    console.log('[lawX] ошибка при скачивании картинки: ' + error.message);
                    reject(error);
                    return;
                }
                console.log('[lawX] картинка успешно скачана в: ' + savedPath);
                resolve(savedPath);
            });
        });

        // Проверяем наличие файла на диске перед отправкой пользователю
        if (!fs.existsSync(filePath)) {
            console.log('[lawX] ОШИБКА: файл не найден после скачивания: ' + filePath);
            throw new Error('файл картинки не найден после скачивания');
        }

        // Получаем метаданные файла для логирования
        const fileStats = fs.statSync(filePath);
        console.log('[lawX] размер скачанного файла: ' + fileStats.size + ' байт');

        // Отправляем готовое изображение пользователю через Telegram API
        console.log('[lawX] отправляю картинку пользователю...');
        await ctx.replyWithPhoto(
            { source: fs.createReadStream(filePath) },
            {
                caption: '🎨 Ваша картинка готова! ✨\n\n' +
                    '📝 Промпт: "' + prompt + '"\n' +
                    '📐 Размер: ' + IMAGE_SIZE + '\n' +
                    '🤖 Сгенерировано нейросетью DALL-E 2\n\n' +
                    '💡 Хотите сгенерировать ещё? Просто отправьте новый промпт с командой /image!\n' +
                    '⭐ Если вам понравился результат поставьте боту оценку в магазине ботов!',
                parse_mode: 'HTML'
            }
        );

        console.log('[lawX] картинка успешно отправлена пользователю ' + username);

        // Удаляем временный файл после успешной отправки для экономии дискового пространства
        console.log('[lawX] удаляю временный файл: ' + filePath);
        fs.unlinkSync(filePath);
        console.log('[lawX] временный файл успешно удален');

        // Обновляем счётчик успешных генераций для статистики
        totalImagesGenerated++;
        console.log('[lawX] всего картинок сгенерировано за сессию: ' + totalImagesGenerated);

        // Удаляем сообщение с прогресс-баром после отправки результата
        try {
            await ctx.telegram.deleteMessage(chatId, progressMessageId);
            console.log('[lawX] сообщение с прогрессбаром удалено');
        } catch (deleteError) {
            console.log('[lawX] не удалось удалить сообщение с прогрессбаром: ' + deleteError.message);
            console.log('[lawX] это не критично пользователь просто увидит старое сообщение');
        }

    } catch (error) {
        // ОБЯЗАТЕЛЬНО останавливаем прогресс-бар при ошибке, чтобы избежать утечки интервала
        clearInterval(progressInterval);

        console.log('[lawX] ОШИБКА при генерации картинки: ' + error.message);
        console.log('[lawX] стек ошибки: ' + error.stack);

        // Заменяем прогресс-бар сообщением об ошибке
        try {
            await ctx.telegram.editMessageText(
                chatId,
                progressMessageId,
                null,
                '❌ Произошла ошибка при генерации картинки!\n\n' +
                '🔧 Причина: ' + error.message + '\n\n' +
                '💡 Попробуйте ещё раз через несколько минут или измените промпт.\n' +
                '📞 Если ошибка повторяется обратитесь в поддержку бота @lawx_support\n\n' +
                '🎨 Нейросеть DALL-E иногда бывает перегружена но она скоро снова заработает! ✨'
            );
        } catch (editError) {
            console.log('[lawX] не удалось обновить сообщение об ошибке: ' + editError.message);
            // Fallback: отправляем новое сообщение, если не удалось отредактировать старое
            await ctx.reply('❌ Произошла ошибка при генерации картинки! Попробуйте позже. 🎨');
        }
    }
}

// Возвращает текущую статистику модуля генерации изображений
function getImageStats() {
    console.log('[lawX] запрошена статистика генерации картинок');
    return {
        totalGenerated: totalImagesGenerated,
        imageSize: IMAGE_SIZE,
        maxPromptLength: MAX_PROMPT_LENGTH,
        minPromptLength: MIN_PROMPT_LENGTH,
        tempDir: TEMP_DIR
    };
}

console.log('[lawX] модуль генерации картинок полностью инициализирован и готов принимать запросы от пользователей');

module.exports = { handleGenerateImage, validatePrompt, generateFileName, downloadImage, getImageStats };
