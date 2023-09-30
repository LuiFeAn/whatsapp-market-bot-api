const bot = require('../bot');

class BotService {

    infos(){

        const { botName, isOnline  } = bot;

        return {
            botName,
            isOnline
        }

    }

}

module.exports = new BotService();