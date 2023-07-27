
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
            styleList:'\n\n------------------------------\n\nConfigurações:\n',

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


    async sendMessageMediaMedia(mimeType,data,fileName){

        const media = new MessageMedia(mimeType,data,fileName);

        await this.say(user.id,media);

    }

    async handleMessage(message){

        const user = await userRepository.findOne({
            id: message.from
        });

        try {


            const lowerMessage = message.body.toLowerCase();

            userLastMessageService.setLastMessage(message.from,lowerMessage);

            const botBusy = botBusyRepository.findOne(message.from);

            if( !botBusy ) botBusyRepository.add(message.from);

            if( botBusy?.isBusy ) return

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

            const cart = await cartService.getCart(user.id);

            if( !userState ){

                userStateInMemoryRepository.addState(user.id);

                await this.say(user.id,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁. Como posso ajudar ?`)

                await this.say(user.id,this.defaultMessages.selectMenuOption);

                await this.say(user.id,`${this.defaultMessages.initialMenu}${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                return;


            }


            if(['c','carrinho'].includes(lowerMessage) 
                && ['CHOOSE_MENU_OPTION','CHOOSE_ITEM','SELECT_PRODUCT_QUANTY','SEARCH_PRODUCT'].includes(userState.current_state)){

                const shoppingList = await cartItemsService.getStatus(cart.id);

                if( shoppingList ){

                    await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

                }

                userStateInMemoryRepository.updateState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                clearMemoryService.clearUserLastProductAndList(user.id);

                userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                if( shoppingList ){

                    await this.say(user.id,`Atualmente, você possui os seguintes produtos no seu carrinho:\n${shoppingList}`);

                }

                await this.say(user.id,this.defaultMessages.menuCheckout);

                return

            }

            
            const handleUserState = {

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1'];

                    const handleMenuOption = {

                        '1': async () => {

                            await cartService.createCart(user.id);

                            userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT")

                            await this.say(user.id,`Pesquise por algum produto.${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                        },

                        'default': async () => {

                            await message.reply('Opção inválida.')

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

<<<<<<< HEAD
                            userStateInMemoryRepository.updateState(user.id,"DELIVERY_METHOD");
=======
                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.updateState(user.id,"CONFIRM_ADRESS");
>>>>>>> e5c65187f24bfc6afc069ea6d30c9417bc5d6072

                            await this.say('Escolha o método de entrega\n1 - Entregar em Casa\n2 - Vou retirar na loja');

                        }, 

                        "6": async () => {

                            userStateInMemoryRepository.updateState(user.id,null);

                            clearMemoryService.clearUserLastProductAndList(user.id);
                            
                            await this.say(user.id,`Certo. Até breve, ${user.nome_completo} !`)

                        },

                        "7": async () => {

                        },

                        "default": async () =>{

                            await this.say(user.id,`Ops ! opção inválida.\n${this.defaultMessages.menuCheckout}`);

                        }

                    }

                    const option = valid.find( option => option.includes(lowerMessage) );

                    handleShoppingOptions[ option ?? 'default']();

                },

                "DELIVERY_METHOD": async () => {

                    const isValid = validOptions(['1','2'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,"Opção inválida");

                        return

                    }

                    //Armazena a opção selecionada no repositoróio de "fórmulário" do usuário

                    if( lowerMessage === '1' ){

                        userDataInMemoryRepository.addUserData("ENTREGAR EM CASA");

                        userStateInMemoryRepository.updateState(user.id,"CONFIRM_ADRESS")

                        await this.say(user.id,`${user.nome_completo}, você confirma seu endereço para entrega ?\n"${user.endereco}"`);

                        return

                    }

                    userStateInMemoryRepository.updateState(user.id,"CONFIRM_PAYMENT")

                    userDataInMemoryRepository.addUserData(user.id,"BUSCAR NA LOJA");

                    await this.say(user.id,`O nosso endereço é:\nRua Sebastião Lopes de Menzes 90, Biarro Nova Brasília, Campina Grande.\nS - Sim\nN - Não${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs
                    }`);

                    await this.say(user.id,`${user.nome_completo}Você confirma vir buscar suas compras em nosso endereço?`);

                },

                "CONFIRM_DELIVERY_METHOD": async () => {

                    const isValid = validOptions(['s','n']);

                    if( !isValid ){
                        
                        await this.say(user.id,`Por favor, digite uma opção válida`);

                        return

                    }

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

                    const handlePayment = {

                        '1': async () => {


                        },

                        '2': async () => {

                        },

                        '4': async () => {
                            
                        },

                        "3": async () => {

                            const userShoppingCart = await shoppingCartService.calcUserTotalShoppingCart(user.id);

                            const {  totalShoppingCart } = userShoppingCart;

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

                            await this.sendMessageMediaMedia('image/jpg',base64String,'image.jpg');

                            await this.say(user.id,'Após efetuar o pagamento, por gentileza envie um print do comprovante 😁');

                        },

                        "CONFIRM_ADRESS": async () => {

                            if( lowerMessage.includes('n') ){
                                
                                await this.say(user.id,'Perfeito ! obrigado por confirmar seu endereço 😍');

                                return

                            }

                        },

                        'default': async () => {

                            message.reply('Opção de pagamento inválida !');

                        }


                    }

                    const payment = validPayment.find( payment => payment === message.body);

                    handlePayment[ payment ?? 'default' ]();

                }

            }

            await handleUserState[userState.current_state]();

        }catch(err){

            console.log(err);

            this.say(user.id,'Lamento. Infelizmente um erro interno ocorreu ! Tente novamente mais tarde.');

        }

    }

    async say(user,message,withDelay = true){

        botBusyRepository.update(user,true);

        if( withDelay ){

            await delay();

        }

        await this.client.sendMessage(user,message);

        botBusyRepository.update(user,false);

    }


}

module.exports.Econobot = Econobot;