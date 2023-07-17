const whatsappBotService = require('../services/whatsappBotService');

class WhatsappBotController {

    onQrCode(qrCode){

        whatsappBotService.generateQrCode(qrCode);

    }

    onReady(ready){

        whatsappBotService.start(ready);

    }

    async onMessage(message){

        await whatsappBotService.messsageHandler(message);

    }

}

module.exports = new WhatsappBotController();