const config = require('../config.json')
let timers = require('./timers.json')
const _ = require('lodash')
const p = require('../package.json')

class Timers  {
  constructor () {
    this.delay = config.timers.delay * 60 * 1000
    this.timers = timers.timers
    this.getCommit()
    this.que = []
    setTimeout(() => this.init(), 2000)
  }
  async getCommit() {
    let get = new (require('last-commit-log'))()
    let commit = await get.getLastCommit()
    await this.timers.push(`Версия бота: ${p.version}, последние изменение: ${commit.subject} ${commit.sanitizedSubject}`)
  }
  async init() {
    if (_.isNil(global.streamCreated)) return
    let delay = this.delay
    let i = 0
    let timers = this.timers
    setInterval(() => {
      i = timers[i] ? i : 0
      global.say(timers[i])
      i++
    }, delay)
  }
  
}

module.exports = new Timers()