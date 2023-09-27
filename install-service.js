const Service = require('node-windows').Service;

const path = require('path');

const econoApiSVC = new Service({
    name:'Econobot',
    description: 'Serviço responsável pela aplicação Econobot, BOT responsável pelo atendimento ao cliente.',
    script: path.join(__dirname,'src','index.js'),
    env: [
        { name: 'SERVER_PORT', value: '3001' },
        { name: 'ECONOBOT_DB_USER', value: '' },
        { name: 'ECONOBOT_DB_HOST', value: '' },
        { name: 'ECONOBOT_DB_PASSWORD', value: '' },
        { name: 'ECONOBOT_DB_NAME', value: '' },
        { name: 'ECONOBOT_DB_PORT', value: '' },
        { name: 'BOT_ENABLE', value: 'true' },
        { name: 'ECONOCOMPRAS_DB_USER', value: '' },
        { name: 'ECONOCOMPRAS_DB_HOST', value: '' },
        { name: 'ECONOCOMPRAS_DB_PASSWORD', value: '' },
        { name: 'ECONOCOMPRAS_DB_NAME', value: '' },
        { name: 'ECONOCOMPRAS_DB_PORT', value: '' },
        { name: 'ECONOCOMPRAS_PIX_KEY', value: '' },
        { name: 'ECONOCOMPRAS_PIX_USER', value: '' }
    ]
});

econoApiSVC.on('install',function(){

    econoApiSVC.start();

});

econoApiSVC.install();