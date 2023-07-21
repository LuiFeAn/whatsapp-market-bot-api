const delay = require('../utils/delay');
const userRepository = require('../repositories/userRepository');
const userInMemoryRepository = require('../repositories/userInMemoryRepository');
const userLastSelectedItemInMemoryRepository = require("../repositories/userLastSelectedItemInMemoryRepository");
const productRepository = require("../repositories/productRepository");
const validPhoneNumber = require('../utils/isAPhoneNumber');
const shoopingInMemoryRepository = require('../repositories/shoopingInMemoryRepository');
const itemsListInMemoryRepository = require("../repositories/itemsListInMemoryRepository");
const qrCodeTerminal = require("qrcode-terminal");
const User = require("./user");

class Econobot {

    client

    botName

    defaultMessages

    constructor({ client, botName }){

        this.botName = botName

        this.client = client;

        this.defaultMessages = {
            selectMenuOption:'Escolha a opção que deseja: \n1 - Pesquisar Produto(s)'
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
        
            if( !user ){

                const userInMemory = userInMemoryRepository.findOne(number);

                if( !userInMemory ){

                    userInMemoryRepository.insert(new User(message.from,'WAITING_MESSAGE_NAME'));

                    await this.say(number,`Olá ! me chamo ${this.botName} e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
        
                    await this.say(number,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
        
                    await this.say(number,'Primeiramente, qual é seu nome completo ? 👀');

                    return;


                }
    
        
                const handleUserRegisterSteps = {
        
                    'WAITING_MESSAGE_NAME': async () => {
        
                        if( body.length < 12 ){
        
                            await message.reply('Hmmm... me parece que este não é seu nome completo. Por gentileza, me envie seu nome completo para que eu possa completar seu cadastro !');
        
                            return;
        
                        }

                        
                        userInMemory.setCurrentStep("WAITING_MESSAGE_NUMBER");

                        await message.reply(`Perfeito, ${body}`);

                        userInMemory.setName(body);

                        await this.say(userInMemory.id,'Agora peço me informe o seu telefone para contato 📳');

        
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

                        userInMemory.setCurrentStep("WAITING_MESSAGE_ADRESS");

                        userInMemory.setNumber(body);
        
                        await message.reply('Show !')
        
                        await this.say(userInMemory.id,'E por último, mas não menos importante: seu endereço 📬');

        
                    },
        
                    'WAITING_MESSAGE_ADRESS': async () => {
        
                        userInMemory.setAdress(body);

                        userInMemory.setCurrentStep("CHOOSE_MENU_OPTION");
        
                        await userRepository.insert(userInMemory);
        
                        await this.say(userInMemory.id,'Perfeito ! seu cadastro está completo 😎😆');

                        await this.say(userInMemory.id,this.defaultMessages.selectMenuOption);

                        userInMemoryRepository.delete(number);

                        return;
                        
        
                    },
                    
        
                }
        
                await handleUserRegisterSteps[userInMemory.current_step]();

                return
        
            }

            const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(number);

            if( !user.current_step ){

                await this.say(user.id,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `)

                await this.say(user.id,this.defaultMessages.selectMenuOption);

                await userRepository.setCurrentStep(user.id,"CHOOSE_MENU_OPTION");

                return;


            }


            const lowerMessage = body.toLowerCase();

            if( lowerMessage.includes("carrinho")){

                if( !userShoppingCart ){

                    await this.say(user.id,'Ops... parece que no momento você não tem nenhum item no seu carrinho 👀\n Que tal adicionar alguns itens?');

                    return

                }

                await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

                const { products } = userShoppingCart;

                const productsWithCalcPerItem = products.map( item => ({
                    ...item,
                    produto: item.produto.toUpperCase(),
                    total: ( item.quanty * item.preco )
                }));

                const totalShoppingCart = productsWithCalcPerItem.reduce((acc,item) => (
                    acc + item.total
                ),0);

                for await( const product of productsWithCalcPerItem ){

                    await this.say(user.id,`*${product.produto}*\n*${product.quanty}* *UND X ${product.preco} - R$ ${product.total}*`,false);

                }

                await this.say(user.id,`Valor total ${totalShoppingCart}`,false);


                await this.say(user.id,`*O que deseja fazer ? digite a opção desejada.*\n\n1 - Pesquisar novo(s) produto(s)\n2 - Deletar Produto\n3 - Alterar quantidade de produto\n4 - Limpar carrinho\n5 - Finalizar pedido`);
                
                await userRepository.setCurrentStep(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                return

            }

            if( lowerMessage.includes("finalizar atendimento")){

                await userRepository.setCurrentStep(user.id,null);

                userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                await this.say(user.id,`Certo. Até breve, ${user.nome_completo} !`)
        
                return

            }

            
            const handleUserState = {


                'USER_SHOPPING_MANAGER_OPTIONS': async () => {

                    const valid = [ "1","2" ];

                    const handleShoppingOptions = {

                        "1": async () => {

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);;

                            itemsListInMemoryRepository.removeItemsList(user.id);

                            await this.say(user.id,'Qual o produto que você gostaria de pesquisar?');

                            await userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                        },

                        "2": async () => {

                        },

                        "default": async () =>{

                            await this.say(number,"Opção inválida !");

                        }

                    }

                    const option = valid.find( option => option.includes(lowerMessage) );

                    handleShoppingOptions[ option ?? 'default']();

                },

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1','2'];

                    const handleMenuOption = {

                        '1': async () => {

                            await userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                            const userShoppingCart = shoopingInMemoryRepository.getItemFromShoppingCart(user.id);

                            if( !userShoppingCart ){

                                await this.say(user.id,`${user.nome_completo}, Antes de partir para as compras, irei dar uma breve introdução sobre minhas funcionalidades.\n\nPara adicionar um produto ao seu carrinho, basta digitar o número correspondente do produto na lista para que eu possa identifica-lo.\n\nPara gerênciar seu carrinho, você pode digitar a qualquer momento *carrinho*`)

                                await this.say(user.id,'Dito isso, qual produto você gostaria de pesquisar ? 😁');


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

                    await this.say(user.id,'Aguarde um momento enquanto eu consulto aqui nossas prateleiras 😉 !');

                    const products = await productRepository.findAll({
                        codigo_barras: body,
                        product: body
                    });

                    if( products.length === 0 ){

                        await message.reply(`Poxa, infelizmente não temos "${body}" no momento ! procure por outro produto, ou se preferir, digite "finalizar atendimento" para encerrar seu atendimento 😉`);

                        return

                    }


                    await Promise.all(products.map(async ( product, id )=>{

                        await this.say(user.id,`${id+=1} - *PRODUTO: ${product.produto}* *CÓDIGO DE BARRAS: ${product.codigo_barra}* *R$ ${product.preco}*`)

                    }));

                    itemsListInMemoryRepository.addItemsToList({
                        id: user.id,
                        items: products
                    });

                    await userRepository.setCurrentStep(user.id,"CHOOSE_ITEM");

                },

                "CHOOSE_OPTION_AFTER_SEARCH_PRODUCT": async () => {

                    const validOptions = ["sim"];

                    const handleOption = {

                        "sim": async () => {

                            await this.say(user.id,'Qual o outro item da lista que você gostaria de adicionar ?');

                            userLastSelectedItemInMemoryRepository.removeSelectedItem(number);

                            await userRepository.setCurrentStep(user.id,"CHOOSE_ITEM");

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

                    await this.say(user.id,`Qual a quantidade de "${items[index].produto}" que você gostaria de adicionar ao seu carrinho ?`);

                    userLastSelectedItemInMemoryRepository.addSelectedItem({
                        id: user.id,
                        selected_item: items[index]
                    })

                    await userRepository.setCurrentStep(user.id,"SELECT_PRODUCT_QUANTY");


                },

                "SELECT_PRODUCT_QUANTY": async () => {

                    const quanty = Number(body);

                    if( !quanty ){

                        await message.reply('Ops ! parece que isso não é um número. Por favor, informe a quantidade de itens que deseja adicionar ao seu carrinho.');

                        return

                    }

                    const { selected_item } = userLastSelectedItemInMemoryRepository.getSelectedItem(number);

                    await this.say(user.id,`*Perfeito ! acabei de adicionar ${body}x quantidade(s) de ${selected_item.produto} ao seu carrinho 😉*"`);

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

                    await this.say(user.id,`Deseja adicionar mais algum produto desta lista ?\nCaso queira, digite "sim", do contrário, digite *carrinho* para gerenciar seu pedido e realizar ações como modificar quantidade, remover, limpar seu carrinho ou finalizar seu pedido 😁.`);

                    await userRepository.setCurrentStep(user.id,"CHOOSE_OPTION_AFTER_SEARCH_PRODUCT");

                },

                "GOTO_PAYMENT": async () => {

                    const validPayment = ['1','2'];

                    const handlePayment = {

                        '1': async () => {

                            await this.say(user.id,`${user.nome_completo}, por favor, confirme se seu endereço está correto:\n\n${user.endereco}`);

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

            await handleUserState[user.current_step]();


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