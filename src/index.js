const bot = require("./bot");
const dotenv = require('dotenv');

dotenv.config();

( async () => {

    if(JSON.parse(process.env.BOT_ENABLE)){

        bot.initialize();
    
        require('./routines/clearInMemory');

        require("./webSocket");
        
    }
    

})();

