const whatsappBotService = require('../services/whatsappBotService');

class WhatsappBotController {

    onQrCode(qrCode){

        return whatsappBotService.generateQrCode(qrCode);

    }

    onReady(ready){

        return whatsappBotService.start(ready);

    }

    async onMessage(message){

        await whatsappBotService.messsageHandler(message);

        return

    }

}

module.exports = new WhatsappBotController();