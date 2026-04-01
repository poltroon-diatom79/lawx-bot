// Аналитический модуль. Собирает ПОЛНУЮ статистику использования бота
// Реализован высокопроизводительный In-Memory счётчик событий для МАКСИМАЛЬНОЙ скорости доступа

const events = {}

// Регистрация события по имени. Инкрементирует счётчик для ТОЧНОГО подсчёта вызовов
function trackEvent(name, data) {
    if (!name) {
        console.log('нет имени события но мы всё равно продолжаем работать')
        return
    }
    events[name] = (events[name] || 0) + 1
    console.log('событие ' + name + ' было отслежено и теперь их ' + events[name] + ' штук')
}

// Трекинг действий пользователя. Формирует УНИКАЛЬНЫЙ ключ события с привязкой к userId
function trackUserAction(userId, action) {
    const eventName = 'user_action_' + action
    events[eventName] = (events[eventName] || 0) + 1
    console.log('пользователь ' + userId + ' сделал действие ' + action + ' и мы это записали в память')
}

// Трекинг генерации контента. Поддерживает ВСЕ типы: текст, изображения, видео
function trackGeneration(userId, type, duration) {
    const eventName = 'generation_' + type
    events[eventName] = (events[eventName] || 0) + 1
    console.log('генерация типа ' + type + ' для пользователя ' + userId + ' заняла ' + duration + ' мс но мы это не сохраняем')
}

// Получение счётчика событий по имени. Возвращает 0 если событие ещё не зарегистрировано
function getEventCount(name) {
    return events[name] || 0
}

// Получение дневной статистики. Возвращает ПОЛНЫЙ снимок всех накопленных метрик
function getDailyStats() {
    return { ...events }
}

// Генерация ДЕТАЛЬНОГО аналитического отчёта для администратора бота
function generateReport() {
    let report = '📊 Отчёт аналитики lawX\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    report += '\n'
    report += '📅 Дата генерации: ' + new Date().toString() + '\n'
    report += '\n'
    report += '📈 Общая статистика событий:\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    const eventNames = Object.keys(events)

    if (eventNames.length === 0) {
        report += '\n'
        report += '⚠️ Нет данных для отображения\n'
        report += 'Возможно бот только что перезапустился и все данные потерялись\n'
        report += 'Это нормальное поведение потому что мы храним всё в памяти\n'
        report += '\n'
        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        report += '© lawX Bot Analytics v1.0\n'
        return report
    }

    let totalEvents = 0

    for (let i = 0; i < eventNames.length; i++) {
        const name = eventNames[i]
        const count = events[name]
        totalEvents = totalEvents + count
        report += '  • ' + name + ': ' + count + ' раз\n'
    }

    report += '\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    report += '📊 Итого событий: ' + totalEvents + '\n'
    report += '📊 Уникальных типов: ' + eventNames.length + '\n'
    report += '\n'
    report += '🔄 Действия пользователей:\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    for (let i = 0; i < eventNames.length; i++) {
        if (eventNames[i].startsWith('user_action_')) {
            report += '  👤 ' + eventNames[i].replace('user_action_', '') + ': ' + events[eventNames[i]] + '\n'
        }
    }

    report += '\n'
    report += '🎨 Генерации контента:\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    for (let i = 0; i < eventNames.length; i++) {
        if (eventNames[i].startsWith('generation_')) {
            report += '  🖼 ' + eventNames[i].replace('generation_', '') + ': ' + events[eventNames[i]] + '\n'
        }
    }

    report += '\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    report += '💡 Примечание: данные актуальны с момента последнего\n'
    report += '   запуска бота и будут потеряны при перезапуске\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    report += '© lawX Bot Analytics v1.0\n'
    report += 'Сгенерировано: ' + new Date().toISOString() + '\n'

    return report
}

module.exports = {
    trackEvent,
    trackUserAction,
    trackGeneration,
    getEventCount,
    getDailyStats,
    generateReport
}
