var winston = require('winston')
const format = winston.format
const printf = format.printf
const combine = format.combine
const timestamp = format.timestamp
var moment = require('moment-timezone')

global.log = winston.createLogger({
    json: false, 
    levels: { info: 1, chatIn: 1, chatOut: 1 },
    format: combine(
        printf(info => {
            let level
            if (info.level === 'info') level = '!!!'
            if (info.level === 'chatIn') level = '>>>'
            if (info.level === 'chatOut') level = '<<<'
            let timestamp = moment().tz('Europe/Moscow').format('YYYY-MM-DD[T]HH:mm:ss.SSS')
            return `${timestamp} ${level} ${info.message}`
          })
      ),
    transports: [
        new winston.transports.Console()
      ]
  })
  