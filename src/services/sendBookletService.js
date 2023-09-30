const bookletService = require('./bookletService');

const { MessageMedia } = require("whatsapp-web.js");

const bot = require('../bot');

class SendBookletService{

    async sendBooklets(toUsers){

        const booklets = await bookletService.getAllBooklets();

        for await(const booklet of booklets){

            const media = await MessageMedia.fromUrl(booklet.encarte);

            for await(const user of toUsers ){

                await bot.client.sendMessage(user,media,{
                    caption: booklet.mensagem
                });

            }

        }

    }

}

module.exports = new SendBookletService();