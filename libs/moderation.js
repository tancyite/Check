const config = require('../config.json')
const _ = require('lodash')

let cooldown = false
function say(msg) {
  if (cooldown) {
    global.log.info(`Right now timeout message on cooldown, not send it to chat`)
  }
  else {
    cooldown = true
    global.say({message: msg}) 
    setTimeout(() => cooldown = false, 1 * 60 * 1000)
  }
}


global.permit = []
global.permitWarn = []
global.capsWarn = []
global.meWarn = []
global.symbolsWarn = []
global.longWarn = []
global.chat.on('PRIVMSG', async obj => {
  if (obj.isSelf) return;
  if (links(obj)) {
    return
  }
  else if (long(obj)) {
    return
  }
  else if (caps(obj)) {
    return
  }
  else if (action(obj)) {
    return
  }
  else if (symbols(obj)) {
    return
  }
})

function links(obj) {
  var urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/ig
  if (obj.tags.isModerator || obj.tags.isSubscriber) return false;
  if (obj.message.includes('clips.twitch.tv')) return false;
  if (global.permit.includes(obj.tags.displayName)) {
    let index = global.permit.indexOf(obj.tags.displayName)
    if (index !== -1) global.permit.splice(index, 1)
    return false;
  }
  if (!global.permitWarn.includes(obj.tags.displayName) && obj.message.search(urlRegexp) >= 0) {
    global.permitWarn.push(obj.tags.displayName)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 1, 'Ссылки запрещены')
    say(`@${obj.tags.displayName} ссылки запрещены. [предупреждение]`)
    return true
  }
  if(obj.message.search(urlRegexp) >= 0) {
    let index = global.permitWarn.indexOf(obj.tags.displayName)
    if (index !== -1) global.permitWarn.splice(index, 1)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 600, 'Ссылки запрещены')
    say(`@${obj.tags.displayName} ссылки запрещены`)
    return true
  }
}

function caps(obj) {
  if (obj.tags.isModerator || obj.tags.isSubscriber) return false;
  if (obj.message.startsWith('!')) return false;
  var msg = obj.message
  var capsLength = 0
  const regexp = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/gi
  if (msg.length < 10) return false;
  for (let i = 0; i < msg.length; i++) {
		if (msg.charAt(i) == msg.charAt(i).toUpperCase() && _.isNull(msg.charAt(i).match(regexp))) {
      capsLength += 1
    }
  }
  if (!global.capsWarn.includes(obj.tags.displayName) && Math.ceil(capsLength / (msg.length / 100)) > 60) {
    global.capsWarn.push(obj.tags.displayName)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 1, 'Капс запрещён [предупреждение]')
    say(`@${obj.tags.displayName} капс запрещён. [предупреждение]`)
    return true;
  }
  if (Math.ceil(capsLength / (msg.length / 100)) > 60) {
    let index = global.capsWarn.indexOf(obj.tags.displayName)
    if (index !== -1) global.capsWarn.splice(index, 1)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 60, 'Капс запрещён')
    say(`@${obj.tags.displayName} капс запрещён`)
    return true;
  }
}

function action(obj) {
  if (obj.tags.isModerator) return false;
  if (!global.meWarn.includes(obj.tags.displayName) && obj.message.startsWith('\u0001ACTION')) {
    global.meWarn.push(obj.tags.displayName)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 1, '/me запрещено [предупреждение]')
    say(`@${obj.tags.displayName} /me запрещено. [предупреждение]`)
    return true;
  }
  if (obj.message.startsWith('\u0001ACTION')) {
    let index = global.meWarn.indexOf(obj.tags.displayName)
    if (index !== -1) global.meWarn.splice(index, 1)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 600, '/me запрещено')
    say(`@${obj.tags.displayName} /me запрещено.`)
    return true;
  }
}

function symbols(obj) {
  if (obj.tags.isModerator) return false;
  let reg = obj.message.match(/([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g)
  let symbolsLength = 0
  if (obj.message.length < 10) return false;
  for (var item in reg) {
    if (reg.hasOwnProperty(item)) {
      var symbols = reg[item]
      symbolsLength = symbolsLength + symbols.length
    }
  }
  if (!global.symbolsWarn.includes(obj.tags.displayName) && Math.ceil(symbolsLength / (obj.message.length / 100)) >= 60) {
    global.symbolsWarn.push(obj.tags.displayName)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 1, 'слишком много символов [предупреждение]')
    say(`@${obj.tags.displayName} слишком много символов. [предупреждение]`)
    return true;
  }
  if (Math.ceil(symbolsLength / (obj.message.length / 100)) >= 60) {
    let index = global.symbolsWarn.indexOf(obj.tags.displayName)
    if (index !== -1) global.symbolsWarn.splice(index, 1)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 600, 'слишком много символов')
    say(`@${obj.tags.displayName} слишком много символов.`)
    return true;
  }
}

function long(obj) {
  if (obj.tags.isModerator ) return false;
  if (!global.longWarn.includes(obj.tags.displayName) && obj.message.length > 300) {
    global.longWarn.push(obj.tags.displayName)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 1, 'слишком длинное сообщение [предупреждение]')
    say(`@${obj.tags.displayName} слишком длинное сообщение. [предупреждение]`)
    return true;
  }
  if (obj.message.length > 300) {
    let index = global.longWarn.indexOf(obj.tags.displayName)
    if (index !== -1) global.longWarn.splice(index, 1)
    global.chat.timeout(config.twitch.channel, obj.tags.displayName, 600, 'слишком длинное сообщение [предупреждение]')
    say(`@${obj.tags.displayName} слишком длинное сообщение. [предупреждение]`)
    return true;
  }
}
