const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({
       dataPath:'./wppAuth'
    })
});

module.exports = client;