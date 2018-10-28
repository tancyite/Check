const config = require('./config.json')
const TwitchJs = require('twitch-js').default
require('create-if-not-exist')('mmr.txt','пока не задано')
(async () => {
const { chat, api, chatConstants } = new TwitchJs({ 
    token: config.twitch.token, 
    username: config.twitch.username, 
    clientId: config.twitch.clientid })

global.api = await api
global.chat = await chat
let retries = 0
async function connect() {
  let bot = false
  if (!bot) {
    try {
      await chat.connect()
      await chat.join(config.twitch.channel)
      global.log.info(`Joined ${config.twitch.channel}`)
      bot = true
      retries = 0
      await chat.say(config.twitch.channel, `Бот успешно подключился к каналу!`)
    } catch (e) {
      global.log.info(e)
      retries++
      setTimeout(() => { connect() }, 10000 * retries)
      return
    }
  }
}
connect()
chat.say(config.twitch.channel, `/unban satonts`)

chat.on('DISCONNECTED', () => {
  connect()
})
//log on each message
chat.on('PRIVMSG', obj => {
  global.log.chatIn(`${obj.tags.displayName}: ${obj.message}`)
})

//commands handler
var cooldowns = []
chat.on('PRIVMSG', message => {
      if (message.isSelf) return;
      var msg = message.message.toLowerCase()
      if (!msg.startsWith('!')) return;
      var command = msg.slice(1).split(' ')
      try {
        let cmd = require(`./commands/${command[0]}.js`)
        if (cooldowns.includes(command[0])) {
          let whisper = true
          cmd.run(chat, api, message, whisper)
          return
        }
        cooldowns.push(command[0])
        setTimeout(function() {
          let index = cooldowns.indexOf(command[0])
          if (index !== -1) cooldowns.splice(index, 1)
        }, 10 * 1000)
        let whisper = false
        cmd.run(chat, api, message, whisper)
      } catch (err) {
       return
      }
}) 

//init global functions
global.say = message => {
  if (!message.mod && message.whisper) {
    global.log.chatOut(`WHISPER > ${config.twitch.username}: ${message.message}`)
    chat.whisper(message.sender, message.message)
    return true;
  }
  try {
    global.log.chatOut(`${config.twitch.username}: ${message.message}`)
    global.chat.say(config.twitch.channel, message.message)
  } catch (e) {
    console.log(e)
  }
}
require('require-all')(__dirname + '/libs')
})()
process.on('unhandledRejection', function(reason, p){
  console.log("Unhandled Rejection at: ", p)
})
process.on('uncaughtException', function (error) {
  console.log("Unhandled Exception at: ", error)
})