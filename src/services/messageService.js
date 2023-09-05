const bot = require('../bot');

class MessageService {

    async sendMessage(toUser,messsage){

        return bot.say(toUser,messsage);

    }

}

module.exports = new MessageService();