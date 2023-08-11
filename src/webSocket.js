const { server } = require("./server");
const socketIO = require('socket.io');
const corsConfig = require("./cors/config");
const clientRepository = require('./repositories/clientsRepository');

const io = socketIO(server,{
    cors: corsConfig
});

module.exports = io.on('connection',function(socket){

    const clientOrigin = socket.handshake.headers.origin;

    clientRepository.setClient(clientOrigin,socket);

});
