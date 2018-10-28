var http = require('http')
var PORT = process.env.PORT || 3000

function Http () {
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('Hello world!')
    global.log.info(`Simple http server created and listened at: ${PORT} port`)
}).listen(PORT)
}

module.exports = new Http()