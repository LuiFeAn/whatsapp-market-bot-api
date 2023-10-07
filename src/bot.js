const { Econobot } = require('./lib/econobot');
const { Client, LocalAuth } = require('whatsapp-web.js');

const bot = new Econobot({
    botName:'Econobot',
    client: new Client({
        authStrategy: new LocalAuth({
           dataPath:'./wpp_auth'
        }),
        puppeteer:{
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    }),
});

module.exports = bot;
