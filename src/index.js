require('./server');
const { Econobot } = require('./lib/econoBot');
const { Client, LocalAuth } = require('whatsapp-web.js');
const clearMemory = require("./routines/clearInMemory");

const bot = new Econobot({
    botName:'Econobot',
    client: new Client({
        authStrategy: new LocalAuth({
           dataPath:'./wpp_auth'
        })
    }),
});

( async () => {

    await bot.initialize();

    setInterval(() => clearMemory(bot),3 * 60 * 1000);

})();


module.exports = bot;