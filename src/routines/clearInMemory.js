const cron = require('node-cron');
const userLastMessageInMemory = require('../repositories/inMemory/userLastMessageInMemoryRepository');
const userStateInMemoryRepository = require('../repositories/inMemory/userStateInMemoryRepository');
const clearMemoryService = require('../services/clearMemoryService');
const bot = require('../bot');

function checkLastMessages() {

  const lastMessages = userLastMessageInMemory.findAllLastMessages();

  const currentTime = new Date();

  lastMessages.forEach(async function (message) {

    const userState = userStateInMemoryRepository.getState(message.id);

    const currentUserTime = new Date(message.time);
    
    const timeDifferenceMinutes = Math.floor((currentTime - currentUserTime) / (1000 * 60));

    if (userState?.current_state !== 'FINALLY') {

      if (timeDifferenceMinutes >= 3) {

        clearMemoryService.clearUserLastProductAndList(message.id);

        await bot.say(message.id, 'Encerrei seu atendimento por falta de interação, mas sinta-se à vontade para enviar mensagem a qualquer momento 😉');

      }

    }

  });
}

module.exports = cron.schedule('*/1 * * * *', checkLastMessages);
