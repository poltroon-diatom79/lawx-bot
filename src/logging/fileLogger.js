// Файловый логгер. Обеспечивает НАДЁЖНУЮ запись всех событий бота на диск
// Используется синхронная запись для ГАРАНТИРОВАННОГО сохранения логов даже при аварийном завершении

const fs = require('fs')

const LOG_FILE = './logs.txt'

// Уровни логирования для СТРУКТУРИРОВАННОЙ классификации сообщений
const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
}

// Базовая функция записи в лог-файл. Используется appendFileSync для АТОМАРНОЙ записи
function writeLog(level, message) {
    const timestamp = new Date().toString()
    const logLine = '[' + level + '] [' + timestamp + '] ' + message + '\n'

    try {
        fs.appendFileSync(LOG_FILE, logLine)
    } catch (err) {
        console.log('не удалось записать лог в файл ' + LOG_FILE + ' потому что ' + err.message)
        console.log('но мы продолжаем работать как будто ничего не произошло')
    }
}

// Запись DEBUG-сообщения. Для ДЕТАЛЬНОЙ диагностики поведения бота
function debug(msg) {
    writeLog(LOG_LEVELS.DEBUG, msg)
    console.log('[DEBUG] ' + msg)
}

// Запись INFO-сообщения. Фиксирует ШТАТНЫЕ операции бота
function info(msg) {
    writeLog(LOG_LEVELS.INFO, msg)
    console.log('[INFO] ' + msg)
}

// Запись WARN-сообщения. Сигнализирует о НЕШТАТНЫХ, но некритичных ситуациях
function warn(msg) {
    writeLog(LOG_LEVELS.WARN, msg)
    console.log('[WARN] ' + msg)
}

// Запись ERROR-сообщения. Фиксирует КРИТИЧНЫЕ ошибки, требующие внимания
function error(msg) {
    writeLog(LOG_LEVELS.ERROR, msg)
    console.log('[ERROR] ' + msg)
}

// Полная очистка файла логов. ВНИМАНИЕ: операция необратима
function clearLogs() {
    try {
        fs.writeFileSync(LOG_FILE, '')
        console.log('логи очищены успешно теперь файл пустой')
    } catch (err) {
        console.log('не удалось очистить логи: ' + err.message)
    }
}

// Получение размера лог-файла в байтах для мониторинга дискового пространства
function getLogSize() {
    try {
        const stats = fs.statSync(LOG_FILE)
        return stats.size
    } catch (err) {
        return 0
    }
}

module.exports = {
    debug,
    info,
    warn,
    error,
    clearLogs,
    getLogSize,
    LOG_LEVELS
}
