const config = require('../config.json')
const _ = require('lodash')
const { promisify } = require('util')
var fs = require('fs')

class Commons {
    constructor () {
        setTimeout(() => this.getChannelId(), 5000)
        setTimeout(() => this.getUptime(), 10000)
        setInterval(() => this.getUptime(), 10 * 60 * 1000)
        this.commands()
    }
    async getUptime () {
        try {
            if (!global.channelID) return
            let stream = await global.api.get(`streams/${global.channelID}`)
            if (!stream.stream) {
                global.streamCreated = null
                return
            }
            if (!_.isNil(global.streamCreated)) return
            global.streamCreated = await stream.stream.createdAt
            global.log.info(`CreatedAt is settet to ${global.streamCreated}`)
        } catch (error) {
            throw Error(error)
            setTimeout(() => this.getUptime(), 10000)
        }
    }
    async getChannelId() {
        try {
            const id = await global.api.get(`users?login=${config.twitch.channel}`)
            global.channelID = await id.users[0].id
            global.log.info(`Channel id is ${global.channelID}`)
        } catch (e) {
            setTimeout(() => this.getChannelId(), 10000)
        }
    }
    async commands () {
        const readdir = promisify(fs.readdir)
        const files = await readdir('./commands')
        global.commands = await files.map(f => {return `!${f.replace('.js', '')}`}).join(', ')
    }
}

module.exports = new Commons()