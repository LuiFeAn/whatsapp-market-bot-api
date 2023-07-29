const { Econobot } = require('./lib/econoBot');
const { Client, LocalAuth } = require('whatsapp-web.js');

const bot = new Econobot({
    botName:'Econobot',
    client: new Client({
        authStrategy: new LocalAuth({
           dataPath:'./wpp_auth'
        })
    }),
});

module.exports = bot;