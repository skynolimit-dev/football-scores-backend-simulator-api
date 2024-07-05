// Config
const config = {
    matches: require('../config/matches.json'),
    server: require('../config/server.json')
}

let data = {
    matches: []
}

// Server info
const server = {
    port: process.env.PORT || config.server.port
}

module.exports = {
    config,
    data,
    server
}