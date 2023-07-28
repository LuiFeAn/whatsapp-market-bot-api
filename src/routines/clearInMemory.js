const userLastMessageInMemory = require('../repositories/inMemory/userLastMessageInMemoryRepository');
const clearMemoryService = require("../services/clearMemoryService");

function clearMemory(bot) {

  const lastMessages = userLastMessageInMemory.findAllLastMessages();

  const currentTime = new Date();

  lastMessages.forEach(function (message) {

    const currentUserTime = new Date(message.time);

    const timeDifferenceMinutes = Math.floor((currentTime - currentUserTime) / (1000 * 60));

    if (timeDifferenceMinutes >= 3) {

      clearMemoryService.clearUserLastProductAndList(message.id);

      bot.say(message.id,'Encerrei seu atendimento por falta te iteração, mas sinta-se a vontade para enviar mensagem a qualquer momento 😉')

    }

  });

}

module.exports = clearMemory;
