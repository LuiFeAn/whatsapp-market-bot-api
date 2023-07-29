const userLastMessageInMemory = require('../repositories/inMemory/userLastMessageInMemoryRepository');
const userStateInMemoryRepository = require("../repositories/inMemory/userStateInMemoryRepository");
const clearMemoryService = require("../services/clearMemoryService");

function clearMemory(bot) {

  const lastMessages = userLastMessageInMemory.findAllLastMessages();

  const currentTime = new Date();

  lastMessages.forEach(function (message) {

    const userState = userStateInMemoryRepository.getState(message.id);

    const currentUserTime = new Date(message.time);

    const timeDifferenceMinutes = Math.floor((currentTime - currentUserTime) / (1000 * 60));

    if (timeDifferenceMinutes >= 3 && userState.current_state != "FINALLY") {

      clearMemoryService.clearUserLastProductAndList(message.id);

      bot.say(message.id,'Encerrei seu atendimento por falta te iteração, mas sinta-se a vontade para enviar mensagem a qualquer momento 😉')

    }

  });

}

module.exports = clearMemory;
