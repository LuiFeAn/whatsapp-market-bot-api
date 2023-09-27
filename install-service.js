const Service = require('node-windows').Service;

const path = require('path');

const env = require('dotenv');

const econoApiSVC = new Service({
    name:'Econobot',
    description: 'Serviço responsável pela aplicação Econobot, BOT responsável pelo atendimento ao cliente.',
    script: path.join(__dirname,'src','index.js'),
    env: [
        { name: 'SERVER_PORT', value: '3005' },
        { name: 'ECONOBOT_DB_USER', value: process.env.ECONOBOT_DB_USER },
        { name: 'ECONOBOT_DB_HOST', value: process.env.ECONOBOT_DB_HOST  },
        { name: 'ECONOBOT_DB_PASSWORD', value: process.env.ECONOBOT_DB_PASSWORD },
        { name: 'ECONOBOT_DB_NAME', value: process.env.ECONOBOT_DB_NAME },
        { name: 'ECONOBOT_DB_PORT', value: process.env.ECONOBOT_DB_PORT },
        { name: 'BOT_ENABLE', value: process.env.BOT_ENABLE },
        { name: 'ECONOCOMPRAS_DB_USER', value: process.env.ECONOCOMPRAS_DB_USER },
        { name: 'ECONOCOMPRAS_DB_HOST', value: process.env.ECONOCOMPRAS_DB_HOST },
        { name: 'ECONOCOMPRAS_DB_PASSWORD', value: process.env.ECONOCOMPRAS_DB_PASSWORD },
        { name: 'ECONOCOMPRAS_DB_NAME', value: process.env.ECONOCOMPRAS_DB_NAME },
        { name: 'ECONOCOMPRAS_DB_PORT', value: process.env.ECONOCOMPRAS_DB_PORT },
        { name: 'ECONOCOMPRAS_PIX_KEY', value: process.env.ECONOCOMPRAS_PIX_KEY },
        { name: 'ECONOCOMPRAS_PIX_USER', value: process.env.ECONOCOMPRAS_PIX_USER }
    ]
});

econoApiSVC.on('install',function(){

    econoApiSVC.start();

});

econoApiSVC.install();