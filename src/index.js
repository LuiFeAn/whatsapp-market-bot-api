const { Client } = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const userRepository = require('./repositories/userRepository');
const userInMemoryRepository = require('./repositories/userInMemoryRepository');
const userInMemoryStateRepository = require('./repositories/userInMemoryStateRepository');
const validPhoneNumber = require('./utils/isAPhoneNumber');
const delay = require('./utils/delay');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client();

client.on('qr', code => qrCode.generate(code,{
    small:true
}));

client.on('ready', already => console.log('O Bot foi iniciado com sucesso'));

client.on('message', async function(message){

    const { body, from: number } = message;

    if( message.type === 'chat' ){

        const user = await userRepository.findOne({
            id: number
        });
    
        const userStep = userInMemoryStateRepository.findOne(number);
    
        if( !user ){
    
            if( !userStep ){
    
                userInMemoryStateRepository.insert({
                    id: number,
                    step:'WAITING_MESSAGE_NAME'
                });
    
                await client.sendMessage(number,`Olá ! me chamo ECONO-BOT e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
    
                await delay();
    
                await client.sendMessage(number,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
    
                await delay();
    
                await client.sendMessage(number,'Primeiramente, qual é seu nome completo ? 👀');
    
                return;
    
            }
    
            const handleUserRegisterSteps = {
    
                'WAITING_MESSAGE_NAME': async () => {
    
                    if( body.length < 12 ){
    
                        await message.reply(number,'Hmmm... me parece que este não é seu nome completo. Por gentileza, me envie seu nome completo para que eu possa completar seu cadastro !');
    
                        return;
    
                    }
    
                    await delay();
    
                    await message.reply(number,`Perfeito, ${body}`);
    
                    userInMemoryRepository.insert(number);
    
                    userInMemoryRepository.update({
                        id: number,
                        nome_completo: body
                    });
    
                    await delay();
    
                    await client.sendMessage(number,'Agora peço me informe o seu telefone para contato 📳');
    
                    userInMemoryStateRepository.update({
                        id: number,
                        step:'WAITING_MESSAGE_NUMBER'
                    })
    
                },
    
                'WAITING_MESSAGE_NUMBER': async () => {
    
                    if( !validPhoneNumber(body) ){
    
                        await message.reply(number,'Ops ! parece que este número de telefone é inválido. Por favor, envie um número de telefone válido');
    
                        return;
    
                    }
    
                    await delay();
    
                    await message.reply(number,'Show !')
    
                    userInMemoryRepository.update({
                        id: number,
                        numero_telefone: body
                    })
    
                    await delay();
    
                    await client.sendMessage(number,'E por último, mas não menos importante: seu endereço 📬');
    
                    userInMemoryStateRepository.update({
                        id: number,
                        step:'WAITING_MESSAGE_ADRESS'
                    })
    
                },
    
                'WAITING_MESSAGE_ADRESS': async () => {
    
                    userInMemoryRepository.update({
                        id: number,
                        endereco: body
                    });
    
                    await delay();
    
                    const userInMemoryRegister = userInMemoryRepository.findOne(number);
    
                    await userRepository.insert(userInMemoryRegister);
    
                    await client.sendMessage(number,'Perfeito ! seu cadastro está completo 😎😆');
    
                    userInMemoryStateRepository.update({
                        id: number,
                        step:'REGISTER_COMPLETED'
                    });
                    
    
                },
    
                'default': () => null
    
            }
    
            await handleUserRegisterSteps[userStep?.step || 'default']();
    
        }
    
        if( user ){
    
            await client.sendMessage(number,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `);
    
        }

    }


});

client.initialize();

