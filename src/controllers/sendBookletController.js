const sendBookletService = require('../services/sendBookletService');

class SendBookletController {

    async send(req,res){
        
        const { toUsers } = req.body;

        await sendBookletService.sendBooklets(toUsers);

        res.sendStatus(204);

    }

}

module.exports = new SendBookletController();