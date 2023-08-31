const bot = require("./bot");
require('./routines/clearInMemory');
require("./webSocket");
const dotenv = require('dotenv');

dotenv.config();

if(JSON.parse(process.env.BOT_ENABLE)){

    bot.initialize();
    
}

