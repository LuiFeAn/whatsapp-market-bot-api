const client = require('../clients/whatsappClient');
const whatsappBotService = require('../services/whatsappBotService');

class WhatsappBotController {

    onQrCode(qrCode){

        whatsappBotService.generateQrCode(qrCode);

    }

    onReady(ready){

        whatsappBotService.start(ready);

    }

    async onMessage(message){

        try{

            await whatsappBotService.messsageHandler(message);

        }catch(err){

            console.log(err);

            client.sendMessage(message.number,'Infelizmente ocorreu um erro não identificado. Por favor, tente novamente mais tarde ! 🤖❌')

        }

    }

}

module.exports = new WhatsappBotController();