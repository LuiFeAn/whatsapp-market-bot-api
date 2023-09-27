const Service = require('node-windows').Service;

const path = require('path');

var svc = new Service({
    name:'Econobot',
    description: 'Serviço responsável pela aplicação Econobot, BOT responsável pelo atendimento ao cliente.',
    script: path.join(__dirname,'src','index.js'),
});

svc.on('uninstall',function(){

    console.log('Uninstall complete.');

});

svc.uninstall();