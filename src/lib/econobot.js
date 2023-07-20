const delay = require('../utils/delay');
const userInMemoryProcessingMessageRepository = require('../repositories/userInMemoryProcessingMessageRepository');
const userRepository = require('../repositories/userRepository');
const userInMemoryRepository = require('../repositories/userInMemoryRepository');
const userInMemoryStateRepository = require('../repositories/userInMemoryStateRepository');
const userLastSelectedItemInMemoryRepository = require("../repositories/userLastSelectedItemInMemoryRepository");
const productRepository = require("../repositories/productRepository");
const validPhoneNumber = require('../utils/isAPhoneNumber');
const shoopingInMemoryRepository = require('../repositories/shoopingInMemoryRepository');
const itemsListInMemoryRepository = require("../repositories/itemsListInMemoryRepository");
const qrCodeTerminal = require("qrcode-terminal");

class Econobot {

    client

    botName

    defaultMessages

    constructor({ client, botName }){

        this.botName = botName

        this.client = client;

        this.defaultMessages = {
            selectMenuOption:'Escolha a opção que deseja: \n 1 - Pesquisar Produto(s) \n 2 - ...?'
        }

    }

    initialize(){
        
        this.client.on('qr', code => qrCodeTerminal.generate(code,{
            small:true
        }));

        this.client.on('ready', () => console.log('Econobot está pronto para uso !'));

        this.client.on('message',async (message) => {

            const { body, from: number } = message;

            const user = await userRepository.findOne({
                id: number
            });
        
            const userStep = userInMemoryStateRepository.findOne(number);
        
            if( !user ){
        
                if( !userStep ){
        
                    await this.say(number,`Olá ! me chamo ${this.botName} e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
        
                    await this.say(number,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
        
                    await this.say(number,'Primeiramente, qual é seu nome completo ? 👀');

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

        
                        await message.reply(`Perfeito, ${body}`);
        
                        userInMemoryRepository.insert(number);
        
                        userInMemoryRepository.update({
                            id: number,
                            nome_completo: body
                        });

        
                        await this.say(number,'Agora peço me informe o seu telefone para contato 📳');
        
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

        
                        await this.say(number,'E por último, mas não menos importante: seu endereço 📬');
        
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
        
                        await this.say(number,'Perfeito ! seu cadastro está completo 😎😆');

                        await this.say(number,this.defaultMessages.selectMenuOption);

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

                await this.say(number,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `)

                await this.say(number,this.defaultMessages.selectMenuOption);

                userInMemoryStateRepository.insert({
                    id: number,
                    step:'CHOOSE_MENU_OPTION'
                });

                return;


            }
            

            const handleUserState = {


                'USER_SHOPPING_MANAGER': async function(){

                    const userShoppingCart = shoopingInMemoryRepository.createUserShoppingCart(number);
        
                    if( !userShoppingCart ){

                        await message.reply('Ops ! parece que no momento você não tem nenhum item no seu carrinho !');

                        return

                    }

                    await message.reply(`Olá, ${user.nome_completo}. Atualmente este é seu carrinho de compras:`)

                    const { products } = userLastSelectedItemInMemoryRepository;

                    await Promise.all(products.map( async function(product){

                        await this.say(number,`*${product.nome_completo} - ${product.quanty}*`)

                    }));

                },

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1','2'];

                    const handleMenuOption = {

                        '1': async () => {

                            userInMemoryStateRepository.update({
                                id: number,
                                step:'SEARCH_PRODUCT'
                            });

                            const userShoppingCart = shoopingInMemoryRepository.createUserShoppingCart(number);

                            if( !userShoppingCart ){


                                await this.say(number,`${user.nome_completo}, Antes de partir para as compras, irei dar uma breve introdução sobre minhas funcionalidades !`);



                                await this.say(number,'Primeiramente, para você adicionar um produto ao seu carrinho, basta digitar o número correspondente da lista para que eu possa identifica-lo !')



                                await this.say(number,'Para você aumentar, diminuir ou remover um item, você pode digitar a qualquer momento *gerenciar meu carrinho de compras*');



                                await this.say(number,'Dito isso, qual produto você gostaria de pesquisar ? 😁');


                            }


                        },

                        '2': async () => {

                        },

                        'default': async () => {

                            await message.reply('Opção inválida ! Por favor, selecione uma opção válida')

                        },

                    }

                    const validOption = validOptions.find( option => option === body );

                    handleMenuOption[ validOption || 'default' ]();

                },

                'SEARCH_PRODUCT': async () => {

                    await this.say(number,'Aguarde um momento enquanto eu consulto aqui nossas prateleiras 😉 !');

                    const products = await productRepository.findAll({
                        codigo_barras: body,
                        product: body
                    });

                    if( products.length === 0 ){

                        await message.reply(`Poxa, infelizmente não temos "${body}" no momento ! procure por outro produto, ou se preferir, digite "finalizar" para encerrar seu atendimento 😉`);

                        return

                    }

                    await Promise.all(products.map(async function(product,id){

                        await this.say(number,`${id+=1} - *${product.codigo_barra}* - *${product.produto}* / *R$ ${product.preco}*`)

                    }));

                    itemsListInMemoryRepository.addItemsToList({
                        id: number,
                        items: products
                    });

                    userInMemoryStateRepository.update({
                        id: number,
                        step:"CHOOSE_ITEM"
                    });

                },

                "CHOOSE_OPTION_AFTER_SEARCH_PRODUCT": async () => {

                    const validOptions = ["sim","não"];

                    const handleOption = {

                        "sim": async () => {

                            await this.say(number,'Qual o outro item da lista que você gostaria de adicionar ?');

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(number);

                            userInMemoryStateRepository.update({
                                id: number,
                                step:"CHOOSE_ITEM"
                            });

                        },

                        "não": async () => {

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(number);;

                            itemsListInMemoryRepository.removeItemsList(number);

                            await this.say(number,'Qual o outro produto que você gostaria de pesquisar?');

                            userInMemoryStateRepository.update({
                                id: number,
                                step:"SEARCH_PRODUCT"
                            });

                        },

                        "ir para pagamento": async () => {

                            await this.say(number,`Perfeito, ${user.nome_completo} ! vou prosseguir para o pagamento !`);

                            await this.say(number,'Escolha a forma que deseja realizar o pagamento:\n\n1 - Pagar na entrega');

                            userInMemoryStateRepository.update({
                                id: number,
                                step:"GOTO_PAYMENT"
                            });

                        },

                        "default": async () => {

                            await message.reply("Opção inválida !");

                        }

                    }

                    const findOption = validOptions.find( option => option.includes(body.toLowerCase()) );

                    await handleOption[ findOption ?? "default" ]();

                },

                "CHOOSE_ITEM": async () => {

                    const index = Number(body) - 1;

                    const { items } = itemsListInMemoryRepository.getItemsList(number);

                    if( !items[index] ){

                        await message.reply(`Desculpe, mas o item ${body} não foi listado. Por favor, selecione algum dos produtos que listei acima`);

                        return

                    }

                    await this.say(number,`Qual a quantidade de "${items[index].produto}" que você gostaria de adicionar ao seu carrinho ?`);

                    userLastSelectedItemInMemoryRepository.addSelectedItem({
                        id: number,
                        selected_item: items[index]
                    })

                    userInMemoryStateRepository.update({
                        id:  number,
                        step:"SELECT_PRODUCT_QUANTY"
                    })


                },

                "SELECT_PRODUCT_QUANTY": async () => {

                    const quanty = Number(body);

                    if( !quanty ){

                        await message.reply('Ops ! parece que isso não é um número. Por favor, informe a quantidade de itens que deseja adicionar ao seu carrinho.');

                        return

                    }

                    const { selected_item } = userLastSelectedItemInMemoryRepository.getSelectedItem(number);

                    await this.say(number,`Perfeito ! acabei de adicionar ${body}x quantidade(s) de ${selected_item.produto} ao seu carrinho 😉`);

                    const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(number);

                    if( !userShoppingCart ){

                        shoopingInMemoryRepository.createUserShoppingCart(number);

                    }

                    shoopingInMemoryRepository.updateShoppingCart({
                        id: number,
                        productInfos:{
                            product: selected_item,
                            quanty
                        }
                    });

                    await this.say(number,'Deseja adicionar mais alguma coisa da pesquisa anterior? Digite "sim" se desejar e "não" se quiser pesquisar por novo(s) produto(s).\n Se desejar finalizar sua(s) compra(s) digite "ir para pagamento"');

                    userInMemoryStateRepository.update({
                        id: number,
                        step:"CHOOSE_OPTION_AFTER_SEARCH_PRODUCT"
                    })

                },

                "GOTO_PAYMENT": async () => {

                    const validPayment = ['1','2'];

                    const handlePayment = {

                        '1': async () => {

                            await this.say(number,`${user.nome_completo}, por favor, confirme se seu endereço está correto:\n\n${user.endereco}`);

                        },

                        '2': async () => {

                        },

                        'default': async () => {

                            message.reply('Opção de pagamento inválida !');

                        }


                    }

                    const payment = validPayment.find( payment => payment === body);

                    handlePayment[ payment ?? 'default' ]();

                }

            }

            await handleUserState[userStep.step]();


        });

        this.client.initialize();

    }


    async say(number,message,withDelay = true){

        if( withDelay ){

            await delay();

        }

        await this.client.sendMessage(number,message);
        

    }

    async anyState(message){

        if( message.toLowerCase().includes("gerenciar meu carrinho de compras") ){

            userInMemoryStateRepository.update({
                id: number,
                step:'USER_SHOPPING_MANAGER'
            });

        }

        if( message.toLowerCase().includes("finalizar") ){

            await this.say(number,`Certo. Até breve, ${user.nome_completo} !`)

            userInMemoryStateRepository.remove(number);

            return;

        }

    }


}

module.exports.Econobot = Econobot;