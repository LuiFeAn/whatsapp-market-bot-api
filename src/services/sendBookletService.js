const bookletService = require('./bookletService');

const bot = require('../bot');

class SendBookletService{

    async sendBooklets(toUsers){

        const booklets = await bookletService.getAllBooklets();

        const promises = [];

        booklets.forEach( booklet => (
            toUsers.forEach( toUser => (
                promises.push(bot.sendMessageMediaMedia(toUser.id,'image/jpg',booklet.encarte,'image.jpg'))))
        ));

        await Promise.all(promises);

    }

}

module.exports = new SendBookletService();