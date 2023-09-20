const bookletService = require('./bookletService');

const { MessageMedia } = require("whatsapp-web.js");

const bot = require('../bot');

const fs = require('fs');
const path = require('path');

class SendBookletService{

    async sendBooklets(toUsers){

        const booklets = await bookletService.getAllBooklets();

        const promises = [];

        for await(const booklet of booklets){

            const media = await MessageMedia.fromUrl(booklet.encarte);

            toUsers.forEach(function(user){

                const promise = bot.client.sendMessage(user,media,{
                    caption: booklet.mensagem
                });

                promises.push(promise);

            });

        }


        await Promise.all(promises);

    }

}

module.exports = new SendBookletService();