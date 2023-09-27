const bot = require("./bot");
const dotenv = require('dotenv');
const opn = require('opn');

dotenv.config();

( async () => {

    if(JSON.parse(process.env.BOT_ENABLE)){

        await bot.initialize();
    
        require('./routines/clearInMemory');

        require("./webSocket");

        opn(`http://localhost:${process.env.SERVER_PORT}`)
        
    }
    

})();

