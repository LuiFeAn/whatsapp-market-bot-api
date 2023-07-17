const qrCodeTerminal = require('qrcode-terminal');
const userRepository = require('../repositories/userRepository');
const userInMemoryRepository = require('../repositories/userInMemoryRepository');
const userInMemoryStateRepository = require('../repositories/userInMemoryStateRepository');
const userMessageCounter = require("../utils/userMessageCount");
const validPhoneNumber = require('../utils/isAPhoneNumber');
const delay = require('../utils/delay');
const client = require('../clients/whatsappClient');

const botDefaultMessages = require('../config/botDefaultMessages');

class WhatsappBotService {

    generateQrCode(qrCode){

        qrCodeTerminal.generate(qrCode,{
            small:true
        });

    }

    start(ready){

        console.log('O BOT foi conectado ao whatsapp com sucesso !');

    }

    async messsageHandler(message){

        const { body, from: number } = message;

        const user = await userRepository.findOne({
            id: number
        });
    
        const userStep = userInMemoryStateRepository.findOne(number);
    
        if( !user ){
    
            if( !userStep ){
    
                await client.sendMessage(number,`Olá ! me chamo ECONO-BOT e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
    
                await delay();
    
                await client.sendMessage(number,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
    
                await delay();
    
                await client.sendMessage(number,'Primeiramente, qual é seu nome completo ? 👀');

                userInMemoryStateRepository.insert({
                    id: number,
                    step:'WAITING_MESSAGE_NAME'
                });
    
                return;
    
            }
    
            const handleUserRegisterSteps = {
    
                'WAITING_MESSAGE_NAME': async () => {
    
                    if( body.length < 12 ){
    
                        await message.reply('Hmmm... me parece que este não é seu nome completo. Por gentileza, me envie seu nome completo para que eu possa completar seu cadastro !');
    
                        return;
    
                    }
    
                    await delay();
    
                    await message.reply(`Perfeito, ${body}`);
    
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
    
                        await message.reply('Ops ! parece que este número de telefone é inválido. Por favor, envie um número de telefone válido');
    
                        return;
    
                    }

                    const numberExists = await userRepository.findOne({
                        numero_telefone: body
                    });

                    if( numberExists ){

                        await message.reply('Este número já se encontra cadastrado no nosso sistema. Por gentileza, informe outro número');

                        return

                    }
    
                    await message.reply('Show !')
    
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
    
                    const userInMemoryRegister = userInMemoryRepository.findOne(number);
    
                    await userRepository.insert(userInMemoryRegister);
    
                    await client.sendMessage(number,'Perfeito ! seu cadastro está completo 😎😆');

                    await delay();

                    await client.sendMessage(number,botDefaultMessages.selectMenuOption);

                    userInMemoryRepository.delete(number);

                    userInMemoryStateRepository.update({
                        id: number,
                        step:'CHOOSE_MENU_OPTION'
                    })
                    
    
                },
    
                'default': () => null
    
            }
    
            await handleUserRegisterSteps[userStep?.step || 'default']();

            return
    
        }


        if( !userStep ){

            await client.sendMessage(number,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `);

            delay();

            await client.sendMessage(number,botDefaultMessages.selectMenuOption);

            userInMemoryStateRepository.insert({
                id: number,
                step:'CHOOSE_MENU_OPTION'
            });

            return;


        }

        const handleUserState = {

            'CHOOSE_MENU_OPTION': async () => {

                const validOptions = ['1','2'];

                const handleMenuOption = {

                    '1': async () => {

                        await client.sendMessage(number,'Qual produto você gostaria de pesquisar ?');

                    },

                    '2': async () => {

                    },

                    'default': async () => {

                        await message.reply('Opção inválida ! Por favor, selecione uma opção válida')

                    },

                }

                const validOption = validOptions.find( option => option === body );

                handleMenuOption[ validOption || 'default' ]();


            }

        }

        await handleUserState[userStep.step]();


    }

}

module.exports = new WhatsappBotService();