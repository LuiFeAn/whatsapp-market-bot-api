const messageService = require('../services/messageService');

class MessageController {

    async create(req,res){

        await messageService.sendMessage(req.body.toUser,req.body.message);

        res.sendStatus(204);

    }

}

module.exports = new MessageController();