const bot = require("./bot");
const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const routes = require('./routes');
require('./routines/clearInMemory');
env.config();

( async () => {

    await bot.initialize();

    const app = express();

    const PORT_ = process.env.SERVER_PORT || 3004

    app.use(cors());

    app.use(express.json());
    
    app.use(routes);

    app.listen(PORT_,function(){
        console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
    });

})();


