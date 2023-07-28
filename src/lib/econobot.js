
//Utilitários

const { QrCodePix } = require("qrcode-pix"); 
const delay = require('../utils/delay');
const validPhoneNumber = require('../utils/isAPhoneNumber');
const { v4 } = require("uuid");
const qrCodeTerminal = require("qrcode-terminal");
const { toBRL } = require('../utils/toBRL');
const env = require("dotenv");
const { MessageMedia } = require("whatsapp-web.js");

env.config();

const shoppingCartService = require("../services/shoppingCartService");

//Repositórios

const shoppingCartRepository = require('../repositories/shoppingCartRepository');
const userInfosRepository = require('../repositories/userInfosRepository');
const botBusyRepository = require('../repositories/inMemory/botBusyInMemoryRepository');
const userRepository = require('../repositories/userRepository');
const productRepository = require("../repositories/productRepository");

//Repositórios em memória

const UserInfosForm = require("./userForm");
const userFormInMemoryRepository = require('../repositories/inMemory/userFormInMemoryRepository');
const itemsListInMemoryRepository = require("../repositories/inMemory/itemsListInMemoryRepository");
const userLastSelectedItemInMemoryRepository = require("../repositories/inMemory/userLastSelectedItemInMemoryRepository");
const userStateInMemoryRepository = require("../repositories/inMemory/userStateInMemoryRepository");
const userDataInMemoryRepository = require("../repositories/inMemory/userDataInMemoryRepository");
const userLastMessageService = require('../services/userLastMessageInMemoryService');

const clearMemoryService = require("../services/clearMemoryService");
const cartService = require("../services/userCartService");
const cartItemsService = require("../services/cartItemsService");

const validIndex = require("../utils/validIndex");
const validOptions = require("../utils/validOptions");
const onliFirstName = require("../utils/onlyFirstName");
const currentDate = require("../utils/currentDate");

class Econobot {

    client

    botName

    defaultMessages

    currentNumber

    constructor({ client, botName }){

        this.botName = botName

        this.client = client;

        this.defaultMessages = {
            selectMenuOption:`*A cada etapa algumas opções serão apresentadas para você, e basta você responder com o número ou a letra da a opção desejada*`,
            initialMenu:'*Escolha a opção desejada*\n1 - Fazer pedido',
            menuCheckout:"*O que deseja fazer ? digite a opção desejada.*\n\n1 - Pesquisar novo(s) produto(s)\n2 - Deletar Produto\n3 - Alterar quantidade de produto\n4 - Limpar carrinho\n5 - Finalizar pedido\n6 - Finalizar atendimento",
            paymentMenu:"",
            globalConfigs:"C - Carrinho",
            styleList:'\n\n------------------------------\n\n',

        }

        this.handleMessage = this.handleMessage.bind(this);

    }

    initialize(){
        
        this.client.on('qr',this.handleQrCode);

        this.client.on('ready',this.handleReady);

        this.client.on('message',this.handleMessage);

        this.client.initialize();

    }

    handleQrCode(qrCode){
        
        qrCodeTerminal.generate(qrCode,{
            small:true
        })

    }

    handleReady(ready){

        console.log('Econobot está pronto para uso !');

    }


    async sendMessageMediaMedia(userId,mimeType,data,fileName){

        const media = new MessageMedia(mimeType,data,fileName);

        await this.say(userId,media);

    }

    async handleMessage(message){


        try {

            const user = await userRepository.findOne({
                id: message.from
            });

            const lowerMessage = message.body.toLowerCase();

            userLastMessageService.setLastMessage(message.from,lowerMessage);

            console.log(botBusyRepository.findBussy(user.id));

            if( botBusyRepository.findBussy(user.id) ) return


            if( !user ){

                const userInMemory = userFormInMemoryRepository.findOne(message.from);

                if( !userInMemory ){

                    const newInMemoryUser = new UserInfosForm(message.from,'WAITING_MESSAGE_NAME');

                    userFormInMemoryRepository.insert(newInMemoryUser);;

                    await this.say(message.from,`Olá ! me chamo ${this.botName} e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
        
                    await this.say(message.from,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
        
                    await this.say(message.from,'Primeiramente, qual é seu nome completo ? 👀');

                    return;


                }

        
                const handleUserRegisterSteps = {
        
                    'WAITING_MESSAGE_NAME': async () => {
        
                        if( message.body.length < 12 ){
        
                            await message.reply('Hmmm... me parece que este não é seu nome completo. Por gentileza, me envie seu nome completo para que eu possa completar seu cadastro !');
        
                            return;
        
                        }

                        
                        userInMemory.setCurrentStep("WAITING_MESSAGE_NUMBER");

                        await message.reply(`Perfeito, ${message.body}`);

                        userInMemory.setName(message.body);

                        await this.say(message.from,'Agora peço me informe o seu telefone para contato 📳');

        
                    },
        
                    'WAITING_MESSAGE_NUMBER': async () => {
        

                        if( !validPhoneNumber(message.body) ){
        
                            await message.reply('Ops ! parece que este número de telefone é inválido. Por favor, envie um número de telefone válido');
        
                            return;
        
                        }

                        const numberExists = await userRepository.findOne({
                            numero_telefone: message.body
                        });

                        if( numberExists ){

                            await message.reply('Este número já se encontra cadastrado no nosso sistema. Por gentileza, informe outro número');

                            return

                        }

                        userInMemory.setCurrentStep("WAITING_MESSAGE_ADRESS");

                        userInMemory.setNumber(message.body);
        
                        await message.reply('Show !')
        
                        await this.say(message.from,'E por último, mas não menos importante: seu endereço 📬');

        
                    },
        
                    'WAITING_MESSAGE_ADRESS': async () => {
        
                        userInMemory.setAdress(message.body);

                        userInMemory.setCurrentStep("CHOOSE_MENU_OPTION");
        
                        const { id, nome_completo, endereco, numero_telefone, current_step } = userInMemory;

                        await userRepository.insertUser({
                            id,
                            nome_completo,
                            current_step,
                            nivel_acesso_id: 1
                        });

                        await userInfosRepository.insertInfos({
                            usuario_id: id,
                            endereco,
                            numero_telefone
                        });
                        
                        userStateInMemoryRepository.addState(message.from,"CHOOSE_MENU_OPTION");
        
                        await this.say(message.from,'Perfeito ! seu cadastro está completo 😎😆');

                        await this.say(message.from,`${this.defaultMessages.selectMenuOption}\n${this.defaultMessages.initialMenu}`);

                        userFormInMemoryRepository.delete(message.from);
                        
        
                    },
                    
        
                }
        
                return await handleUserRegisterSteps[userInMemory.current_step]();
        
            }

            const userState = userStateInMemoryRepository.findState(user.id);

            const cart = await cartService.getCartFromUser(user.id);

            user.nome_completo = onliFirstName(user.nome_completo);

            if( !userState ){

                userStateInMemoryRepository.addState(user.id);

                await this.say(user.id,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁`);

                if( cart ){

                    const items = await cartItemsService.findItems(cart.id);

                    userStateInMemoryRepository.updateState(user.id,"DEMAND_ALREADY_EXISTS_OPTIONS");
                    
                    await this.say(user.id,`${user.nome_completo}, identiquei que você tem um carrinho com ${items.length} item(s), você deseja continuar com esse carrinho?\n\n1 - Sim, desejo\n2 - Não, desejo realizar um novo pedido`);

                    return

                }

                userStateInMemoryRepository.updateState(user.id,"CHOOSE_MENU_OPTION")

                await this.say(user.id,"Como posso ajudar?");

                await this.say(user.id,this.defaultMessages.selectMenuOption);

                await this.say(user.id,`${this.defaultMessages.initialMenu}${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                return;


            }


            if(['c','carrinho'].includes(lowerMessage) 
                && ['CHOOSE_MENU_OPTION','CHOOSE_ITEM','SELECT_PRODUCT_QUANTY','SEARCH_PRODUCT','CONFIRM_DELIVERY_METHOD','EXCHANGED_OPTIONS'].includes(userState.current_state)){


                if( !cart ){

                    userStateInMemoryRepository.updateState(user.id,"CHOOSE_MENU_OPTION");

                    await this.say(user.id,`Para acessar o menu do carrinho, primeiramente você tem que realizar um pedido !\n1 - Fazer pedido`);

                    return

                }

                userStateInMemoryRepository.updateState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                clearMemoryService.clearUserLastProductAndList(user.id);

                userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                userDataInMemoryRepository.removeUserData(user.id);

                await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

                const shoppingList = await cartItemsService.getStatus(cart.id);

                if( shoppingList ){

                    await this.say(user.id,`Atualmente, você possui os seguintes produtos no seu carrinho:\n${shoppingList}`);

                }

                await this.say(user.id,this.defaultMessages.menuCheckout);

                return

            }

            
            const handleUserState = {

                "DEMAND_ALREADY_EXISTS_OPTIONS": async () => {

                    const isValid = validOptions(['1','2'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,`Você deseja continuar com esse carrinho?\n\n1 - Sim, desejo\n2 - Não, desejo realizar um novo pedido`);

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"CHOOSE_MENU_OPTION")

                    if( lowerMessage === '2' ){

                        await cartService.deleteCart(cart.id);

                        await this.say(user.id,"Certo !")

                        
                    }

                    await this.say(user.id,this.defaultMessages.selectMenuOption);

                    await this.say(user.id,`${this.defaultMessages.initialMenu}${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                },

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1'];

                    const handleMenuOption = {

                        '1': async () => {

                            await cartService.createCart(user.id);

                            userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT")

                            await this.say(user.id,`Pesquise por algum produto.${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                        },

                        'default': async () => {

                            await message.reply('Não compreendi o que você quis dizer 😥');

                        },

                    }

                    const validOption = validOptions.find( option => option === message.body );

                    handleMenuOption[ validOption || 'default' ]();

                },

                'SEARCH_PRODUCT': async () => {

                    const products = await productRepository.findAll({
                        codigo_barras: message.body,
                        descricao: message.body
                    });


                    if( products.length === 0 ){

                        await message.reply(`Não consegui encontrar o produto "${lowerMessage}". Tente buscar por outro nome, ou se preferir, pesquise por outro produto.`);

                        return

                    }

                    products.push({Descricao:'',precoUnitario:'',Codigo_Barra:''});

                    let productSearchList = '*Digite o número da opção correspondente ao produto*\n';

                    products.forEach((product,id)=>{

                        const index = id+=1;

                        if( product.Descricao && product.precoUnitario ){

                            productSearchList += `\n*${index} - ${product.Descricao} - R$ ${product.precoUnitario}*`

                        }

                        if( id === products.length - 1){

                            productSearchList += `${this.defaultMessages.styleList}*N - Nenhuma das opções*\n*C - Carrinho*`;

                        }

                    });

                    await this.say(user.id,productSearchList);

                    userStateInMemoryRepository.updateState(user.id,"CHOOSE_ITEM");

                    itemsListInMemoryRepository.addItemsToList({
                        id: user.id,
                        items: products
                    });


                },

                "CHOOSE_ITEM": async () => {

                    if( lowerMessage === 'n' ){
                        
                        itemsListInMemoryRepository.removeItemsList(user.id);

                        userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                        await this.say(user.id,'Lamento não ter encontrado o produto que você deseja. Por gentileza, pesquise novamente pelo produto');

                        return;

                    }

                    const lastItems = itemsListInMemoryRepository.getItemsList(user.id);

                    const index = validIndex(lowerMessage);

                    const { items } = lastItems;

                    const product = items[index];

                    if( !product ){

                        await message.reply(`Desculpe, mas o item ${message.body} não foi listado. Por favor, selecione algum dos produtos que listei acima`);

                        return

                    }

                    const userAlreadyHasProduct = await cartItemsService.findItem(cart.id,product.Descricao);
                    
                    if( userAlreadyHasProduct ){

                        await this.say(user.id,`${user.nome_completo}, você já possui "${product.Descricao}" no seu carrinho.\nPor favor, selecione outro produto da lista.\n\n*Se deseja adicionar mais quantidades deste item, digite c e selecione a "alterar quantidade*`);

                        return;

                    }

                    itemsListInMemoryRepository.removeItemsList(user.id);

                    userLastSelectedItemInMemoryRepository.addSelectedItem({
                        id: user.id,
                        selected_item: product
                    });

                    userStateInMemoryRepository.updateState(user.id,"SELECT_PRODUCT_QUANTY");

                    await this.say(user.id,`Digite a quantidade de *"${product.Descricao}"* que deseja adicionar ao carrinho`);



                },

                "SELECT_PRODUCT_QUANTY": async () => {

                    const quanty = Number(message.body);

                    const product = userLastSelectedItemInMemoryRepository.getSelectedItem(user.id);

                    if( !quanty || quanty <= 0 ){

                        await this.say(user.id,'Por favor, digite uma quantidade válida.');

                        return

                    }

                    const { selected_item } = product;

                    await cartItemsService.addItem({
                        cart_id: cart.id,
                        product_name: selected_item.Descricao,
                        product_value: selected_item.precoUnitario,
                        quanty: message.body
                    });

                    userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                    userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                    await this.say(user.id,`${message.body}X quantidade(s) de "${selected_item.Descricao}" adicionado(s) ao carrinho.`);

                    await this.say(user.id,`Digite o nome do próximo produto desejado.${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);


                },

                'USER_SHOPPING_MANAGER_OPTIONS': async () => {

                    const valid = [ "1","2","3","4","5","6"];

                    const shoppingList = await cartItemsService.getStatus(cart.id);

                    const verifyCart = async () => {

                        if( !shoppingList ){

                            await this.say(user.id,"Carrinho vazio 🛒");

                            return

                        }

                        return true;

                    }

                    const handleShoppingOptions = {

                        "1": async () => {

                            userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                            await this.say(user.id,'Qual o produto que você gostaria de pesquisar?');


                        },

                        "2": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.updateState(user.id,"REMOVE_ITEM_FROM_CART");

                            await this.say(user.id,`Por gentileza, digite o número do item que você gostaria de remover do carrinho\n${shoppingList}`);


                        },

                        "3": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.updateState(user.id,"UPDATE_ITEM_FROM_CART");

                            await this.say(user.id,`Por gentileza, digite o ID do produto que você gostaria de alterar a quantidade\n${shoppingList}`);

                        },

                        "4": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            await cartItemsService.removeAllItems(cart.id);

                            await this.say(user.id,`Seu carrinho foi esvaziado. O que deseja fazer agora?\n\b${this.defaultMessages.menuCheckout}`);

                        },

                        "5": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.updateState(user.id,"DELIVERY_METHOD");

                            await this.say(user.id,'Escolha o método de entrega\n\n1 - Entregar em Casa\n2 - Vou retirar na loja');

                        }, 

                        "6": async () => {

                            userStateInMemoryRepository.removeState(user.id);

                            clearMemoryService.clearUserLastProductAndList(user.id);

                            userDataInMemoryRepository.removeUserData(user.id);
                            
                            await this.say(user.id,`Certo. Até breve, ${user.nome_completo} !`);

                        },

                        "7": async () => {

                        },

                        "default": async () =>{

                            await this.say(user.id,`${this.defaultMessages.menuCheckout}`);

                        }

                    }

                    const option = valid.find( option => option.includes(lowerMessage) );

                    handleShoppingOptions[ option ?? 'default']();

                },

                "DELIVERY_METHOD": async () => {

                    const isValid = validOptions(['1','2'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,`Escolha o método de entrega\n1 - Entregar em Casa\n2 - Vou retirar na loja`);

                        return

                    }

                    //Armazena a opção selecionada no repositoróio de "fórmulário" do usuário

                    if( lowerMessage === '1' ){

                        userDataInMemoryRepository.setUserData(user.id,{
                            delivery_method:"ENTREGAR EM CASA"
                        });

                        userStateInMemoryRepository.updateState(user.id,"CONFIRM_ADRESS")

                        await this.say(user.id,`${user.nome_completo}, você confirma seu endereço para entrega ?\n\nSeu endereço:"${user.endereco}"\n\nS - Sim, confirmo\nN - Não, está incorreto`);

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"CONFIRM_DELIVERY_METHOD")

                    userDataInMemoryRepository.setUserData(user.id,{
                        delivery_method:"BUSCAR NA LOJA"
                    });

                    await this.say(user.id,`O nosso endereço é:\nRua Sebastião Lopes de Menzes 90, Biarro Nova Brasília, Campina Grande.`);

                    await this.say(user.id,`${user.nome_completo}, você confirma vir buscar suas compras em nosso endereço?\n\nS - Sim, desejo buscar\nN - Não, prefiro escolher outro método\n${this.defaultMessages.globalConfigs
                    }`);

                },

                "CONFIRM_DELIVERY_METHOD": async () => {

                    const isValid = validOptions(['s','n'],lowerMessage);

                    if( !isValid ){
                        
                        await this.say(user.id,`S - Sim, desejo buscar\nN - Não, prefiro escolher outro método${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                        return

                    }


                    if( lowerMessage === 'n' ){

                        userDataInMemoryRepository.removeUserData(user.id);

                        userStateInMemoryRepository.updateState(user.id,"DELIVERY_METHOD");

                        await this.say(user.id,`Escolha o método de entrega\n1 - Entregar em Casa\n2 - Vou retirar na loja`);
                       
                        return

                    }

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    userStateInMemoryRepository.updateState(user.id,"PAYMENT_OPTIONS");

                    await this.say(user.id,`Escolha a forma de pagamento desejada:\nTotal do pedido: ${toBRL(totalShoppingCart)}\n\n1 - Dinheiro\n2 - Cartão\n3- PIX`);


                },

                "UPDATE_ITEM_FROM_CART": async () => {

                    const index = validIndex(lowerMessage);

                    const cartItems = await cartItemsService.findItems(cart.id);

                    if( !cartItems[index] ){

                        await message.reply('Este item não se encontra no seu carrinho');

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"CHOOSE_NEW_ITEM_QUANTY")
                    
                    userLastSelectedItemInMemoryRepository.addSelectedItem({
                        id: user.id,
                        selected_item: cartItems[index]
                    })

                    await this.say(user.id,`Digite a nova quantidade de "${cartItems[index].nome_produto}"`);

                },

                "CHOOSE_NEW_ITEM_QUANTY": async () => {

                    const { selected_item } = userLastSelectedItemInMemoryRepository.getSelectedItem(user.id);

                    const quanty = Number(message.body);

                    if( !quanty || quanty <= 0 ){

                        await this.say(user.id,'Por favor, digite uma quantidade válida.');

                        return

                    }

                    await cartItemsService.updateItem({
                        cart_id: cart.id,
                        item_id: selected_item.id,
                        quanty
                    });

                    const shoppingList = await cartItemsService.getStatus(cart.id);

                    userStateInMemoryRepository.updateState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                    userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                    this.say(user.id,`*A quantidade de "${selected_item.nome_produto}" foi atualizada para ${quanty}.*\n\n${shoppingList}\n\n${this.defaultMessages.menuCheckout}`);



                },

                "REMOVE_ITEM_FROM_CART": async () => {

                    const index = validIndex(lowerMessage);

                    const cartItems = await cartItemsService.findItems(cart.id);

                    if( !cartItems[index] ){

                        await message.reply('Este item não se encontra no seu carrinho');

                        return

                    }

                    await cartItemsService.removeItem(cart.id,cartItems[index].id);

                    const shoppingList = await cartItemsService.getStatus(cart.id);

                    userStateInMemoryRepository.updateState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                    this.say(user.id,`*O produto "${cartItems[index].nome_produto}" foi removido do carrinho.*\n\n${shoppingList ?? 'Carrinho Vazio 🛒 '}\n\n${this.defaultMessages.menuCheckout}`);

                },


                "PAYMENT_OPTIONS": async () => {

                    const validPayment = ['1','2','3'];

                    const userData = userDataInMemoryRepository.getUserData(user.id);

                    const handlePayment = {

                        '1': async () => {
                           
                            userData.payment_method = 'DINHEIRO';

                            userStateInMemoryRepository.updateState(user.id,"EXCHANGED_OPTIONS");

                            const  { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                            await this.say(user.id,`Total do pedido: ${toBRL(totalShoppingCart)}\nVocê precisará de troco ?\n\nS - Sim, irei precisar de troco\nN - Não preciso de troco\nV - Voltar\nC - Carrinho`);

                        },

                        '2': async () => {
                            
                            userData.payment_method = 'CARTÃO';

                            userStateInMemoryRepository.updateState(user.id,"DEMAND_OBSERVATION");

                            await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');

                        },

                        "3": async () => {

                            userData.payment_method = 'PIX';

                            userStateInMemoryRepository.updateState(user.id,"DEMAND_OBSERVATION");

                            await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');

                        },

                        'default': async () => {

                            message.reply(`Opção de pagamento inválida !\n\nEscolha a forma de pagamento desejada:\n1 - Dinheiro\n2 - Cartão\n3- PIX`);

                        }


                    }

                    const payment = validPayment.find( payment => payment === message.body);

                    handlePayment[ payment ?? 'default' ]();

                },


                "EXCHANGED_OPTIONS": async () => {

                    const isValid = validOptions(['s','n','v'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,"Você precisará de troco ?\n\nS - Sim, irei precisar de troco\nN - Não preciso de troco\nV - Voltar\nC - Carrinho");

                        return;

                    }


                    if( lowerMessage === 'n' ){

                        userStateInMemoryRepository.updateState(user.id,"DEMAND_OBSERVATION");

                        await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');

                        return

                    }

                    if( lowerMessage === 'v' ){

                        userStateInMemoryRepository.updateState(user.id,"PAYMENT_OPTIONS");

                        await this.say(user.id,"Escolha a forma de pagamento desejada:\n1 - Dinheiro\n2 - Cartão\n3- PIX");

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"DEMAND_EXCHANGE");

                    await this.say(user.id,"Você precisará de troco para quanto?");


                },

                "DEMAND_OBSERVATION": async () => {

                    const userData = userDataInMemoryRepository.getUserData(user.id);

                    if( lowerMessage != "n" ){

                        userData.observation = message.body;

                    }

                    userStateInMemoryRepository.updateState(user.id,"DEMAND_CONFIRMATION");

                    const shoppingList = await cartItemsService.getStatus(cart.id);

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);
            
                    const demandStatus = `*Confirme se seu pedido está correto e escolha finalizar 👇*\n\n*Pedido: xxxx*\n*Horário: ${currentDate()}*\n*Cliente: ${user.nome_completo}*\n*Celular: ${user.numero_telefone}*\n*Entrega: ${userData.delivery_method}*\n*Endereço: ${user.endereco}*\n*Complemento: ${userData?.complement ?? "N/A"}*\n\n------------------------------\n\n${shoppingList}\n\n------------------------------\n\n*Taxa de entrega: ${userData.delivery_method === 'BUSCAR NA LOJA' ? 'N/A*' : 'R$ 5,00 R$*'}\n*Total: ${userData.delivery_method === 'BUSCAR NA LOJA' ? toBRL(totalShoppingCart) :'(Carrinho + Taxa de entrega)' + "" + toBRL(totalShoppingCart + 5 )}*\n*Pagamento: ${userData.payment_method}*\n*Troco para: ${ userData?.exchange_value ? toBRL(userData.exchange_value) : 'N/A' }*\n*Observação: ${userData?.observation ? userData.observation + "*" : "N/A*"}\n*Obrigado!*\n\n------------------------------\n\nF - Finalizar\nC - Cancelar pedido`

                    await this.say(user.id,demandStatus);

                },

                "DEMAND_EXCHANGE": async () => {

                    const exchange = Number(lowerMessage);

                    if( !exchange || exchange <= 0 ){

                        await this.say(user.id,'Por gentileza, digite uma quantidade válida de troco.');

                        return

                    }

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    if( exchange < totalShoppingCart ){

                        await this.say(user.id,`O total do seu pedido é ${toBRL(totalShoppingCart)}. Por gentileza, informe um valor válido.`);

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"DEMAND_OBSERVATION");

                    const userData = userDataInMemoryRepository.getUserData(user.id);

                    userData.exchange_value = exchange;

                    await this.say(user.id,`Perfeito. Troco para ${toBRL(exchange)}`);

                    await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');


                },

                "DEMAND_CONFIRMATION": async () => {

                    const isValid = validOptions(['f','c'],lowerMessage);

                    if( !isValid ){

                        await message.reply('Por gentileza, digite uma opção válida');

                        return;

                    }

                    if( lowerMessage === 'c' ){

                        clearMemoryService.clearUserLastProductAndList(user.id);

                        userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                        userDataInMemoryRepository.removeUserData(user.id);

                        await this.say('Pedido cancelado.');

                        return

                    }

                    const userData = userDataInMemoryRepository.getUserData(user.id);

                    let { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    if( userData.delivery_method === 'ENTREGAR EM CASA' ){

                        totalShoppingCart = totalShoppingCart + 5;

                    }

                    if( userData.payment_method === 'PIX' ){

                        userStateInMemoryRepository.updateState(user.id,"PIX_PROOF");
    
                        await this.say(user.id,`*Envie um PIX no valor de ${toBRL(totalShoppingCart)} para a seguinte chave:*`);
    
                        await this.say(user.id,`*${process.env.ECONOCOMPRAS_PIX_USER}*`);
    
                        await this.say(user.id,'*É possível também realizar o pagamento escaneando o qrCode abaixo:*');
    
                        const payload = QrCodePix({
                            version: "01",
                            key:process.env.ECONOCOMPRAS_PIX_KEY,
                            name: process.env.ECONOCOMPRAS_PIX_USER,
                            transactionId: v4().slice(25),
                            message: "ECONOCOMPRAS",
                            value: totalShoppingCart,
                        });
                
                        const qrCode = await payload.base64();
    
                        const [ resourceType, base64String ] = qrCode.split(',');
    
                        await this.sendMessageMediaMedia(user.id,'image/jpg',base64String,'image.jpg');
    
                        await this.say(user.id,'Após efetuar o pagamento, por gentileza envie um print do comprovante 😁');

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"FINALLY");

                    await this.say(user.id,"Recebemos seu pedido e ele está sendo processado !\nTempo médio para preparação é de 45min ⏱\n\nEconocompras\nNosso negócio é estar com você.")



                },

                "PIX_PROOF": async () => {

                    const isValid = validOptions(['image'],message.type);

                    if( !isValid ){

                       await this.say(user.id,'Por gentileza, envie uma imagem com o seu comprovante de pagamento.');

                       return

                    }

                    userStateInMemoryRepository.updateState(user.id,"FINALLY");

                    await this.say(user.id,"Recebemos seu pedido e ele está sendo processado !\nTempo médio para preparação é de 45min ⏱\n\nEconocompras\nNosso negócio é estar com você.")

                },

                "FINALLY": async () => {

                    await this.say(user.id,`${user.nome_completo}, já recebemos seu pedido e ele está atualmente em processo !\nAguarde. Brevemente voltarei com mais informações 😁`);

                },

                "CONFIRM_ADRESS": async () => {

                    const isValid = validOptions(['s','n'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,'Por favor, digite uma opção válida');

                        return

                    }

                    if( lowerMessage === 'n'){

                        userStateInMemoryRepository.updateState(user.id,"CHANGE_ADRESS")

                        await this.say(user.id,"Por favor, digite o seu novo endereço para entrega");

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"PAYMENT_OPTIONS");

                    await this.say(user.id,'Perfeito ! obrigado por confirmar seu endereço 😍');

                    await this.say(user.id,"Escolha a forma de pagamento desejada:\n1 - Dinheiro\n2 - Cartão\n3- PIX");

                },

                "CHANGE_ADRESS": async () => {

                    await userInfosRepository.updateInfos(user.id,message.body);

                    userStateInMemoryRepository.updateState(user.id,"PAYMENT_OPTIONS")

                    await this.say(user.id,'Obrigado por atualizar seu endereço 😁');

                    await this.say(user.id,"Escolha a forma de pagamento desejada:\n1 - Dinheiro\n2 - Cartão\n3- PIX");

                }

            }

            await handleUserState[userState.current_state]();

        }catch(err){

            console.log(err);

            this.say(message.from,'Lamento. Infelizmente um erro interno ocorreu ! Tente novamente mais tarde.');

        }

    }

    async say(userId,message,withDelay = true){

        botBusyRepository.setBussy(userId)

        if( withDelay ){

            await delay();

        }

        await this.client.sendMessage(userId,message);

        botBusyRepository.removeBussy(userId);

    }
    


}

module.exports.Econobot = Econobot;