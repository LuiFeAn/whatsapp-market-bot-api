const client = require('../clients/whatsappClient');

const whatsappBotController = require('../controllers/whatsappBotController');

client.on('qr',whatsappBotController.onQrCode);

client.on('ready',whatsappBotController.onReady);

client.on('message',whatsappBotController.onMessage);

client.initialize();

