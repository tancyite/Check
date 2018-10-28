const config = require('../config.json')
const _ = require('lodash')
module.exports.run = async (chat, api, message, whisper) => {
    let sender = `@${message.tags.displayName}`
    global.say({
        whisper: whisper, mod: message.tags.isModerator, sender: message.tags.displayName, 
        message: `${sender} Здарова, братишка! Чё,как ты? Keepo /`
    })
}