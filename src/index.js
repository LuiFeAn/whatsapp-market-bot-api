require('./server');
const { Econobot } = require('./lib/econoBot');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const bot = new Econobot({
    botName:'Econobot',
    client: new Client({
        authStrategy: new LocalAuth({
           dataPath:'./wpp_auth'
        })
    }),
});

bot.initialize();