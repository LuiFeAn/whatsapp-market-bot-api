const bot = require("./bot");
const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const routes = require('./routes');
require('./routines/clearInMemory');
const socketIO = require('socket.io');
const clientRepository = require('./repositories/clientsRepository');
env.config();

( async () => {

    const corsConfig = {
        origin:'*',
        methods:['GET','POST','PUT','DELETE','PATCH']
    }    

    await bot.initialize();

    const app = express();

    const PORT_ = process.env.SERVER_PORT || 3004

    const server = app.listen(PORT_,function(){
        console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
    });

    app.use(cors(corsConfig));

    app.use(express.json());
    
    app.use(routes);

    const io = socketIO(server,{
        cors: corsConfig
    });

    io.on('connection',function(socket){

        const clientOrigin = socket.handshake.headers.origin;

        clientRepository.setClient(clientOrigin,socket);

    })

})();


