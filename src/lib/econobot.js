const delay = require('../utils/delay');
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

        
                        await this.say(userStep.id,'Agora peço me informe o seu telefone para contato 📳');
        
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

        
                        await this.say(userStep.id,'E por último, mas não menos importante: seu endereço 📬');
        
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
        
                        await this.say(userStep.id,'Perfeito ! seu cadastro está completo 😎😆');

                        await this.say(userStep.id,this.defaultMessages.selectMenuOption);

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

            const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(number);

            if( !userStep ){

                await this.say(userStep.id,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `)

                await this.say(userStep.id,this.defaultMessages.selectMenuOption);

                userInMemoryStateRepository.insert({
                    id: number,
                    step:'CHOOSE_MENU_OPTION'
                });

                return;


            }

            if( body.toLowerCase().includes("carrinho") ){

                if( !userShoppingCart ){

                    await message.reply('Ops ! parece que no momento você não tem nenhum item no seu carrinho !');

                    return

                }


                await this.say(userStep.id,'1 - Meu Carrinho\n2 - Menu Checkout');

                userInMemoryStateRepository.update({
                    id: number,
                    step:'USER_SHOPPING_MANAGER_OPTIONS'
                });

                return;
    
            }
    
            if( body.toLowerCase().includes("finalizar") ){
    
                userInMemoryStateRepository.remove(number);

                await this.say(userStep.id,`Certo. Até breve, ${user.nome_completo} !`)
    
                return;
    
            }
            
            const handleUserState = {


                'USER_SHOPPING_MANAGER_OPTIONS': async () => {

                    const validOptions = ['1','2'];

                    const handleOption = {

                        '1': async () => {
        
                            await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉')

                            const { products } = userShoppingCart;
        
                            const productsWithCalcPerItem = products.map( item => ({
                                ...item,
                                produto: item.produto.toUpperCase(),
                                total: ( item.quanty * item.preco ).toFixed(2)
                            }));

                            const totalShoppingCart = productsWithCalcPerItem.reduce((acc,item) => (
                                acc + item.total
                            ),0);
        
                            for await( const product of productsWithCalcPerItem ){
        
                                await this.say(userStep.id,`*${product.produto}*\n*${product.quanty}* *UND X ${product.preco} - R$ ${product.total}*`,false);
        
                            }

                            await this.say(userStep.id,`Valor total ${totalShoppingCart}`,false);

                        },

                        '2': async () => {

                            await this.say(userStep.id,`O que deseja fazer ? digite a opção desejada.\n\n 1 - Pesquisar novo(s) produto(s)\n2 - Deletar Produto\n3 - Alterar quantidade de produto\n4 - Limpar carrinho\n5 - Finalizar pedido\n6 - Voltar ao início`);

                            userInMemoryStateRepository.update({
                                id: number,
                                step:'MENU_CHECKOUT_OPTIONS'
                            })

                        },

                        'default': async () => {

                            await this.say(userStep.id,'Opção de Menu inválida !');

                        }

                    }

                    const option = validOptions.find( option => option.includes(body.toLowerCase()));

                    await handleOption[ option ?? 'default' ]();
        

                },

                "MENU_CHECKOUT_OPTIONS": async () => {

                    const validOptions = ["1","2","3","4","5","6"];

                    const handleOption = {

                        "1": async () => {

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(number);;

                            itemsListInMemoryRepository.removeItemsList(number);

                            await this.say(userStep.id,'Qual o produto que você gostaria de pesquisar?');

                            userInMemoryStateRepository.update({
                                id: number,
                                step:"SEARCH_PRODUCT"
                            });

                        }

                    }

                    const option = validOptions.find( option => option.includes(body.toLowerCase()));

                    await handleOption[ option ?? 'default']();

                },

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1','2'];

                    const handleMenuOption = {

                        '1': async () => {

                            const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(number);

                            if( !userShoppingCart ){

                                await this.say(userStep.id,`${user.nome_completo}, Antes de partir para as compras, irei dar uma breve introdução sobre minhas funcionalidades.\n\nPara adicionar um produto ao seu carrinho, basta digitar o número correspondente do produto na lista para que eu possa identifica-lo.\n\nPara gerênciar seu carrinho, você pode digitar a qualquer momento *carrinho*`)

                                await this.say(userStep.id,'Dito isso, qual produto você gostaria de pesquisar ? 😁');


                            }

                            userInMemoryStateRepository.update({
                                id: number,
                                step:'SEARCH_PRODUCT'
                            });


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

                    await this.say(userStep.id,'Aguarde um momento enquanto eu consulto aqui nossas prateleiras 😉 !');

                    const products = await productRepository.findAll({
                        codigo_barras: body,
                        product: body
                    });

                    if( products.length === 0 ){

                        await message.reply(`Poxa, infelizmente não temos "${body}" no momento ! procure por outro produto, ou se preferir, digite "finalizar" para encerrar seu atendimento 😉`);

                        return

                    }


                    await Promise.all(products.map(async ( product, id )=>{

                        await this.say(userStep.id,`${id+=1} - *PRODUTO: ${product.produto}* *CÓDIGO DE BARRAS: ${product.codigo_barra}* *R$ ${product.preco}*`)

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

                    const validOptions = ["sim"];

                    const handleOption = {

                        "sim": async () => {

                            await this.say(userStep.id,'Qual o outro item da lista que você gostaria de adicionar ?');

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(number);

                            userInMemoryStateRepository.update({
                                id: number,
                                step:"CHOOSE_ITEM"
                            });

                        },

                        "default": async () => {

                            await message.reply("Não entendi o que você quis dizer 🤔");

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

                    await this.say(userStep.id,`Qual a quantidade de "${items[index].produto}" que você gostaria de adicionar ao seu carrinho ?`);

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

                    await this.say(userStep.id,`*Perfeito ! acabei de adicionar ${body}x quantidade(s) de ${selected_item.produto} ao seu carrinho 😉*`);

                    const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(number);

                    if( !userShoppingCart ){

                        shoopingInMemoryRepository.createUserShoppingCart(number);

                    }

                    shoopingInMemoryRepository.updateShoppingCart({
                        id: number,
                        productInfos:{
                            ...selected_item,
                            quanty
                        }
                    });

                    await this.say(userStep.id,`Deseja adicionar mais algum produto desta lista ?\nCaso queira, digite "sim", do contrário, digite *carrinho* para gerenciar seu pedido.`);

                    userInMemoryStateRepository.update({
                        id: number,
                        step:"CHOOSE_OPTION_AFTER_SEARCH_PRODUCT"
                    });

                },

                "GOTO_PAYMENT": async () => {

                    const validPayment = ['1','2'];

                    const handlePayment = {

                        '1': async () => {

                            await this.say(userStep.id,`${user.nome_completo}, por favor, confirme se seu endereço está correto:\n\n${user.endereco}`);

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


}

module.exports.Econobot = Econobot;