const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: LocalAuth({
        dataPath:'/wppAuth'
    })
});

module.exports = client;