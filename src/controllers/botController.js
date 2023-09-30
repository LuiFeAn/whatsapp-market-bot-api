const botService = require('../services/botService');

class BotController {

    index(req,res){

        const botInfos = botService.infos();

        res.json(botInfos);

    }

}

module.exports = new BotController();