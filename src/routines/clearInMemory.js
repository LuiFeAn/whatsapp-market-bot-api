const cron = require('node-cron');

const botBusyInMemoryRepository = require('../repositories/inMemory/botBusyInMemoryRepository');
const itemsListInMemoryRepository = require('../repositories/inMemory/itemsListInMemoryRepository');
const userLastSelectedItemInMemoryRepository = require('../repositories/inMemory/userLastSelectedItemInMemoryRepository');
const userLastMessageInMemory = require('../repositories/inMemory/userLastMessageInMemoryRepository');

cron.schedule('*/4 * * * *', () => {

    const userLastMessage = userLastMessageInMemory.findAllLastMessages();

    userLastMessage.forEach(function(user){

         const currentTime = new Date();

         const registeredTime = new Date(user.time);

         const timeDifferenceInMilliseconds = currentTime - registeredTime;

         const timeLimit = 4 * 60 * 1000;

         if (timeDifferenceInMilliseconds > timeLimit) {

             console.log('Usuário', user.id, 'não enviou mensagens nos últimos 4 minutos.');

         } else {

             console.log('Usuário', user.id, 'enviou uma mensagem nos últimos 4 minutos.');
         }

    });

});