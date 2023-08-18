
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

//Repositórios

const userInfosRepository = require('../repositories/userInfosRepository');
const botBusyRepository = require('../repositories/inMemory/botBusyInMemoryRepository');
const userRepository = require('../repositories/userRepository');
const productRepository = require("../repositories/productRepository");

//Repositórios em memória

const itemsListInMemoryRepository = require("../repositories/inMemory/itemsListInMemoryRepository");
const userLastSelectedItemInMemoryRepository = require("../repositories/inMemory/userLastSelectedItemInMemoryRepository");
const userStateInMemoryRepository = require("../repositories/inMemory/userStateInMemoryRepository");
const userDataInMemoryRepository = require("../repositories/inMemory/userDataInMemoryRepository");
const userLastMessageService = require('../services/userLastMessageInMemoryService');

const clearMemoryService = require("../services/clearMemoryService");
const cartService = require("../services/userCartService");
const cartItemsService = require("../services/cartItemsService");
const deliveryFeeService = require('../services/deliveryFeeService');
const demandService = require('../services/demandService');
const userPromotionService = require('../services/userPromotionService');

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
            initialMenu:'\n*Escolha a opção desejada* ou digite *C* para acessar o carrinho\n\n1 - Fazer pedido',
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

        return this.client.initialize();

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


            const [ user, [ userInfos ], userFee ] = await Promise.all([
                userRepository.findOne({
                    id: message.from
                }),
                userInfosRepository.findOne({
                    userId: message.from
                }),
                deliveryFeeService.findOne(message.from)
            ]);

            const lowerMessage = message.body.toLowerCase();

            userLastMessageService.setLastMessage(message.from,lowerMessage);

            const userData = userDataInMemoryRepository.getUserData(message.from); 

            if( botBusyRepository.findBussy( message.from) ) return

            if( !user ){
        
                const handleUserRegisterSteps = {

                    'USER_FIRST_CONTACT': async () => {

                        userDataInMemoryRepository.setUserData(message.from,{
                            currentState:'WAITING_MESSAGE_NAME'
                        });

                        await this.say(message.from,`Olá ! me chamo ${this.botName} e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
        
                        await this.say(message.from,'Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
            
                        await this.say(message.from,'Primeiramente, qual é seu nome completo ? 👀');
    

                    },
        
                    'WAITING_MESSAGE_NAME': async () => {
        
                        if( message.body.length < 12 ){
        
                            await message.reply('Hmmm... me parece que este não é seu nome completo. Por gentileza, me envie seu nome completo para que eu possa completar seu cadastro !');
        
                            return;
        
                        }

                        await message.reply(`Perfeito, ${message.body}`);

                        userData.nome_completo = message.body;

                        await userRepository.insertUser({
                            id: message.from,
                            nome_completo: message.body
                        });

                        delete userData.currentState;

                        userStateInMemoryRepository.setState(message.from,'WAITING_MESSAGE_NUMBER');

                        await this.say(message.from,'Agora peço me informe o seu telefone para contato 📳');

                    },
                    
        
                }
        
                await handleUserRegisterSteps[userData?.currentState ?? 'USER_FIRST_CONTACT']();

                return
        
            }

            const userState = userStateInMemoryRepository.getState(user.id);

            const cart = await cartService.getLastCart(user.id);

            const demands = await demandService.getAll({
                userId: user.id,
            });

            user.nome_completo = onliFirstName(user.nome_completo);

            if( !userState ){

                if( !userInfos ){

                    userStateInMemoryRepository.setState(user.id,"WAITING_MESSAGE_NUMBER");

                    userDataInMemoryRepository.setUserData(user.id,{
                        continue_register: true
                    });

                    await this.say(user.id,"Você não concluiu totalmente seu cadastro, por gentileza, me informe seu número de telefone.")

                    return

                }

                userStateInMemoryRepository.setState(user.id,"CHOOSE_MENU_OPTION");

                await this.say(user.id,`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁`);

                if( cart?.status === 'ABERTO' ){

                    const items = await cartItemsService.findItems(cart.id);

                    if( items.length > 0 ){

                        userStateInMemoryRepository.setState(user.id,"DEMAND_ALREADY_EXISTS_OPTIONS");
                    
                        await this.say(user.id,`${user.nome_completo}, identiquei que você tem um carrinho com ${items.length} item(s), você deseja continuar com esse carrinho?\n\n1 - Sim, desejo\n2 - Não, desejo realizar um novo pedido`);
    
                        return

                    }

                }

                await this.say(user.id,"Como posso ajudar?");

                await this.say(user.id,`${this.defaultMessages.selectMenuOption}\n${this.defaultMessages.initialMenu}`);

                return



            }


            if(['c','carrinho'].includes(lowerMessage) 
                && ['CHOOSE_MENU_OPTION','CHOOSE_ITEM','SELECT_PRODUCT_QUANTY','SEARCH_PRODUCT','CONFIRM_DELIVERY_METHOD','EXCHANGED_OPTIONS','DEMAND_CONFIRMATION','DEMAND_OBSERVATION'].includes(userState.current_state)){


                if( !cart ){

                    userStateInMemoryRepository.setState(user.id,"CHOOSE_MENU_OPTION");

                    await this.say(user.id,`Para acessar o menu do carrinho, primeiramente você tem que realizar um pedido !\n1 - Fazer pedido`);

                    return

                }

                if( cart.status === 'ANÁLISE'){

                    await this.say(user.id,`${user.nome_completo}, o seu pedido está em análise. Aguarde, brevemente voltarei com mais informações 😉`);

                    return

                }

                userStateInMemoryRepository.setState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                clearMemoryService.clearUserLastProductAndList(user.id);

                await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

                const shoppingList = await cartItemsService.getStatus(cart.id);

                if( shoppingList ){

                    await this.say(user.id,`Atualmente, você possui os seguintes produtos no seu carrinho:\n${shoppingList}`);

                }

                await this.say(user.id,this.defaultMessages.menuCheckout);

                return

            }

            
            const handleUserState = {

                'WAITING_MESSAGE_NUMBER': async () => {
        

                    if( !validPhoneNumber(message.body) ){
    
                        await message.reply('Ops ! parece que este número de telefone é inválido. Por favor, envie um número de telefone válido');
    
                        return;
    
                    }

                    const [ numberExists ] = await userInfosRepository.findOne({
                        phoneNumber: message.body
                    });

                    if( numberExists ){

                        await message.reply('Este número já se encontra cadastrado no nosso sistema. Por gentileza, informe outro número');

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"WAITING_MESSAGE_ADRESS");

                    userData.numero_telefone = message.body;
    
                    await message.reply('Show !')
    
                    await this.say(user.id,'Agora me informe seu endereço 📬');

    
                },
    
                'WAITING_MESSAGE_ADRESS': async () => {
    
                    if( message.body.length >= 100 ){

                        await this.say(user.id,'Por gentileza, me informe um endereço válido');

                        return

                    }
                    
                    userStateInMemoryRepository.setState(user.id,"WAITING_NEIGHBORHOOD")

                    userData.endereco = message.body;

                    await this.say(user.id,'Agora, por gentileza, me informe seu bairro.');
                    

                },

                "WAITING_NEIGHBORHOOD": async () => {

                    if( message.body.length >= 65 ){

                        await this.say(message.from,'Por gentileza, me informe um bairro válido');

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"WAITING_HOME_NUMER")

                    userData.bairro = message.body;

                    await this.say(user.id,'Agora, por gentileza, me informe o número da sua residência');


                },

                "WAITING_HOME_NUMER": async () => {


                    if( !Number(message.body) || Number(message.body) <= 0 || message.body.length > 30000 ){

                        await this.say(message.from,'Por favor, informe o número de sua resdiência corretamente');

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"WAITING_COMPLEMENT");

                    userData.numero_casa = message.body;

                    await this.say(user.id,'E por último, mas não menos importante: Adicione um complemento para facilitar a localização de sua residência !')


                },

                "WAITING_COMPLEMENT": async () => {

                    if( message.body.length >= 100 ){

                        await this.say(user.id,'Por gentileza, informe um complemento válido');

                        return

                    }

                    userData.complemento = message.body;

                    for(const prop in userData ){

                       if( typeof userData[prop] === 'string' ){

                            userData[prop] = userData[prop].trim().toUpperCase();

                       }

                    };

                    const { endereco, bairro, numero_casa, complemento  } = userData;

                    if( !userInfos ){
                    
                        userStateInMemoryRepository.setState(user.id,"CONFIRM_PROMOTIONS");

                        await this.say(user.id,`${user.nome_completo}, quer receber nossas promoções e novidades em primeira mão aqui pelo Whatsapp ?\n1 - Sim, desejo\n2 - Não, obrigado`);
    
                        return

                    }

                    await Promise.all[
                        userInfosRepository.updateAdress(user.id,endereco),
                        userInfosRepository.updateNeighBorHood(user.id,bairro),
                        userInfosRepository.updateHouseNumber(user.id,numero_casa),
                        userInfosRepository.updateComplement(user.id,complemento)
                    ]

                    userStateInMemoryRepository.setState(user.id,"PAYMENT_OPTIONS");    

                    await this.say(user.id,`${user.nome_completo}, obrigado por atualizar seu endereço ! 😁`);

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    await this.say(user.id,`Escolha a forma de pagamento desejada:\nTotal do pedido: ${toBRL(totalShoppingCart)}\n\n1 - Dinheiro\n2 - Cartão\n3- PIX`);
                    
                    
                },

                "CONFIRM_PROMOTIONS": async () => {

                    if( !validOptions(['1','2'],lowerMessage) ){

                        await message.reply('Desculpe, não entendi o que você quis dizer !\nDeseja receber nossas promoções e novidades em primeira mão aqui pelo Whatsapp ?\n1 - Sim, desejo\n2 - Não, obrigado');

                        return

                    }

                    if( lowerMessage === '1' ){

                        await userPromotionService.acceptPromotion(user.id);

                        await this.say(user.id,`Obrigado ! você irá receber todas as nossas futuras promoções aqui pelo zap 😉`);

                    }

                    const { endereco, numero_telefone, bairro, numero_casa, complemento  } = userData;

                    try{

                        await userInfosRepository.insertInfos({
                            usuario_id: user.id,
                            endereco,
                            numero_telefone,
                            bairro,
                            numero_casa,
                            complemento
                        });

                        userDataInMemoryRepository.removeUserData(user.id);

                        userStateInMemoryRepository.setState(user.id,"CHOOSE_MENU_OPTION")

                        await this.say(user.id,`${user.nome_completo}, Seu cadastro está completo 😎😆`);

                        await this.say(user.id,`${this.defaultMessages.selectMenuOption}\n${this.defaultMessages.initialMenu}`);


                    }catch(err){

                        await this.say(user.id,'Não foi possível concluir seu cadastro. Tente novamente mais tarde');

                        return

                    }


                },

                "DEMAND_ALREADY_EXISTS_OPTIONS": async () => {

                    const isValid = validOptions(['1','2'],lowerMessage);

                    if( !isValid ){

                        await this.say(user.id,`Você deseja continuar com esse carrinho?\n\n1 - Sim, desejo\n2 - Não, desejo realizar um novo pedido`);

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"CHOOSE_MENU_OPTION")

                    if( lowerMessage === '2' ){

                        await cartService.deleteCart(cart.id);

                        await this.say(user.id,"Certo !")

                        
                    }

                    await this.say(user.id,`${this.defaultMessages.selectMenuOption}\n${this.defaultMessages.initialMenu}`);

                },

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1'];

                    const handleMenuOption = {

                        '1': async () => {

                            if( cart?.status === 'ABERTO' ){

                                await this.say(user.id,`${user.nome_completo}, você já possui um pedido em aberto !\nSe deseja realizar outro pedido, por gentileza, primeiro finalize este.`);

                                return

                            }

                            if( cart?.status === 'ANÁLISE'){

                                await this.say(user.id,`${user.nome_completo}, você já realizou um pedido anteriormente e ele está em análise.\nPor favor, aguarde a conclusão do pedido para que possa realizar novos.`);
            
                                return
            
                            }

                            await cartService.createCart(user.id);

                            userStateInMemoryRepository.setState(user.id,"SEARCH_PRODUCT")

                            await this.say(user.id,`*Você iniciou um novo pedido. Pesquise por algum produto* ou digite *"C"* para acessar o carrinho`);

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

                    userStateInMemoryRepository.setState(user.id,"CHOOSE_ITEM");

                    itemsListInMemoryRepository.addItemsToList({
                        id: user.id,
                        items: products
                    });


                },

                "CHOOSE_ITEM": async () => {

                    if( lowerMessage === 'n' ){
                        
                        itemsListInMemoryRepository.removeItemsList(user.id);

                        userStateInMemoryRepository.setState(user.id,"SEARCH_PRODUCT");

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

                    userStateInMemoryRepository.setState(user.id,"SELECT_PRODUCT_QUANTY");

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

                    userStateInMemoryRepository.setState(user.id,"SEARCH_PRODUCT");

                    await this.say(user.id,`${message.body}X quantidade(s) de "${selected_item.Descricao}" adicionado(s) ao carrinho.`);

                    if( userData?.first_buy_promotion ){

                        const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                        if( totalShoppingCart >= 100 ){

                            userStateInMemoryRepository.setState(user.id,"DELIVERY_METHOD");

                            userDataInMemoryRepository.removeUserData(user.id);

                            await this.say(user.id,`${user.nome_completo}, parabéns ! você ultrapassou ${toBRL(100)} em compras no seu primeiro pedido e acaba de ganhar *taxa de entrega grátis* 😉`);

                            await this.say(user.id,'Escolha o método de entrega\n\n1 - Entregar em Casa\n2 - Vou retirar na loja');
    
                            return

                        }

                        await this.say(user.id,`*Faltam apenas mais ${toBRL( 100 - totalShoppingCart )} para entrega grátis !*`);

                    }

                    await this.say(user.id,`*Digite o nome do próximo produto desejado* ou digite *"C"* para acessar o carrinho`);


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

                            userStateInMemoryRepository.setState(user.id,"SEARCH_PRODUCT");

                            await this.say(user.id,'Qual o produto que você gostaria de pesquisar?');


                        },

                        "2": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.setState(user.id,"REMOVE_ITEM_FROM_CART");

                            await this.say(user.id,`Por gentileza, digite o número do item que você gostaria de remover do carrinho\n${shoppingList}`);


                        },

                        "3": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            userStateInMemoryRepository.setState(user.id,"UPDATE_ITEM_FROM_CART");

                            await this.say(user.id,`Por gentileza, digite o ID do produto que você gostaria de alterar a quantidade\n${shoppingList}`);

                        },

                        "4": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            await cartItemsService.removeAllItems(cart.id);

                            await this.say(user.id,`Seu carrinho foi esvaziado.\n\n${this.defaultMessages.menuCheckout}`);

                        },

                        "5": async () => {

                            const verification = await verifyCart();

                            if( !verification ) return;

                            if( demands.length === 0 ){

                                const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                                if( totalShoppingCart < 100 ){

                                    userStateInMemoryRepository.setState(user.id,"FIRST_BUY_PROMOTION");

                                    this.say(user.id,`${user.nome_completo}, faltam apenas ${toBRL(100 - totalShoppingCart)} para conseguir taxa de entrega grátis no seu primeiro pedido ! quer participar dessa promoção ?\n\n1 - Okay, quero participar\n2 - Não, obrigado`);

                                    return

                                }

                                await this.say(user.id,`${user.nome_completo}, parabéns ! você ultrapassou ${toBRL(100)} em compras no seu primeiro pedido e acaba de ganhar *taxa de entrega grátis* 😉`);

                            }

                            userStateInMemoryRepository.setState(user.id,"DELIVERY_METHOD");

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

                "CONFIRM_DELIVERY_METHOD": async () => {

                    const isValid = validOptions(['s','n'],lowerMessage);

                    if( !isValid ){
                        
                        await this.say(user.id,`S - Sim, desejo buscar\nN - Não, prefiro escolher outro método${this.defaultMessages.styleList}${this.defaultMessages.globalConfigs}`);

                        return

                    }


                    if( lowerMessage === 'n' ){

                        userDataInMemoryRepository.removeUserData(user.id);

                        userStateInMemoryRepository.setState(user.id,"DELIVERY_METHOD");

                        await this.say(user.id,`Escolha o método de entrega\n1 - Entregar em Casa\n2 - Vou retirar na loja`);
                       
                        return

                    }

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    userStateInMemoryRepository.setState(user.id,"PAYMENT_OPTIONS");

                    await this.say(user.id,`Escolha a forma de pagamento desejada:\nTotal do pedido: ${toBRL(totalShoppingCart)}\n\n1 - Dinheiro\n2 - Cartão\n3- PIX`);


                },

                "UPDATE_ITEM_FROM_CART": async () => {

                    const index = validIndex(lowerMessage);

                    const cartItems = await cartItemsService.findItems(cart.id);

                    if( !cartItems[index] ){

                        await message.reply('Este item não se encontra no seu carrinho');

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"CHOOSE_NEW_ITEM_QUANTY")
                    
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

                    userStateInMemoryRepository.setState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

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

                    userStateInMemoryRepository.setState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                    this.say(user.id,`*O produto "${cartItems[index].nome_produto}" foi removido do carrinho.*\n\n${shoppingList ?? 'Carrinho Vazio 🛒 '}\n\n${this.defaultMessages.menuCheckout}`);

                },


                "PAYMENT_OPTIONS": async () => {

                    const validPayment = ['1','2','3'];

                    const handlePayment = {

                        '1': async () => {
                           
                            userData.payment_method = 'DINHEIRO';

                            userStateInMemoryRepository.setState(user.id,"EXCHANGED_OPTIONS");

                            const  { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                            await this.say(user.id,`Total do pedido: ${toBRL(totalShoppingCart)}\nVocê precisará de troco ?\n\nS - Sim, irei precisar de troco\nN - Não preciso de troco\nV - Voltar\nC - Carrinho`);

                        },

                        '2': async () => {
                            
                            userData.payment_method = 'CARTÃO';

                            userStateInMemoryRepository.setState(user.id,"DEMAND_OBSERVATION");

                            await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');

                        },

                        "3": async () => {

                            userData.payment_method = 'PIX';

                            userStateInMemoryRepository.setState(user.id,"DEMAND_OBSERVATION");

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

                        userStateInMemoryRepository.setState(user.id,"DEMAND_OBSERVATION");

                        await this.say(user.id,'Digite alguma observação para seu pedido\nExemplo: "Coloque a banana mais madura..."\n\nN - Não preciso de observação');

                        return

                    }

                    if( lowerMessage === 'v' ){

                        userStateInMemoryRepository.setState(user.id,"PAYMENT_OPTIONS");

                        await this.say(user.id,"Escolha a forma de pagamento desejada:\n1 - Dinheiro\n2 - Cartão\n3- PIX");

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"DEMAND_EXCHANGE");

                    await this.say(user.id,"Você precisará de troco para quanto?");


                },


                "DEMAND_OBSERVATION": async () => {

                    userStateInMemoryRepository.setState(user.id,"DEMAND_CONFIRMATION");

                    if( lowerMessage != "n" ){

                        userData.observation = message.body;

                    }

                    const shoppingList = await cartItemsService.getStatus(cart.id);

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    const date = currentDate();

                    const verifyMethod = totalShoppingCart > 100;

                    const demandTotal =  verifyMethod ? totalShoppingCart : Number(totalShoppingCart) + Number(userFee.taxa);

                    userData.demand_total = demandTotal;
            
                    const demandStatus = `*Confirme se seu pedido está correto e escolha finalizar 👇*\n\n*Horário: ${date}*\n*Cliente: ${user.nome_completo}*\n*Celular: ${userInfos.numero_telefone}*\n*Entrega: ${userData.delivery_method}*\n*Endereço: ${userInfos.endereco}*\n\n------------------------------\n\n${shoppingList}\n\n------------------------------\n\n*Taxa de entrega: ${userData.delivery_method === 'BUSCAR NA LOJA' ? 'N/A*' : verifyMethod ? 'Grátis*' : toBRL(Number(userFee.taxa)) + "*"}\n*Total: ${verifyMethod ? '' : '( Carrinho + Taxa de Entrega )'} ${toBRL(demandTotal)}*\n*Pagamento: ${userData.payment_method}*\n*Troco para: ${ userData?.exchange_value ? toBRL(userData.exchange_value) : 'N/A' }*\n*Observação: ${userData?.observation ? userData.observation + "*" : "N/A*"}\n*Obrigado!*\n\n------------------------------\n\nF - Finalizar\nC - Carrinho`

                    await this.say(user.id,demandStatus);

                },

                "FIRST_BUY_PROMOTION": async () => {

                    if( !validOptions(['1','2'], lowerMessage) ){

                        await this.say(user.id,"Não entendi o que você quis dizer.Deseja adicionar mais itens ao seu carrinho para participar da promoção e obter taxa de entrega grátis ?\n\n1 - Okay, irei adicionar\n2 - Não, obrigado");

                        return

                    }

                    if( lowerMessage === '2' ){

                        userStateInMemoryRepository.setState(user.id,"DELIVERY_METHOD");

                        await this.say(user.id,'Escolha o método de entrega\n\n1 - Entregar em Casa\n2 - Vou retirar na loja');

                        return

                    }

                    userDataInMemoryRepository.setUserData(user.id,{
                        first_buy_promotion: true
                    });

                    userStateInMemoryRepository.setState(user.id,"SEARCH_PRODUCT");

                    await this.say(user.id,"Por favor, pesquise por mais algum produto !");

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

                    userData.exchange_value = exchange;

                    userStateInMemoryRepository.setState(user.id,"DEMAND_OBSERVATION");

                    await this.say(user.id,`Perfeito. Troco para ${toBRL(exchange)}`);

                    await this.say(user.id,'Digite alguma observação para seu pedido\n\n*Exemplo: "Coloque a banana mais madura..*."\n\nN - Não preciso de observação');
                    

                },

                "DEMAND_CONFIRMATION": async () => {

                    const isValid = validOptions(['f'],lowerMessage);

                    if( !isValid ){

                        await message.reply('Por gentileza, digite uma opção válida');

                        return;

                    }


                    if( userData.payment_method === 'PIX' ){

                        userStateInMemoryRepository.setState(user.id,"PIX_PROOF");
    
                        await this.say(user.id,`*Envie um PIX no valor de ${userData.demand_total} para a seguinte chave:*`);
    
                        await this.say(user.id,`*${process.env.ECONOCOMPRAS_PIX_USER}*`);
    
                        await this.say(user.id,'*É possível também realizar o pagamento escaneando o qrCode abaixo:*');
    
                        const payload = QrCodePix({
                            version: "01",
                            key:process.env.ECONOCOMPRAS_PIX_KEY,
                            name: process.env.ECONOCOMPRAS_PIX_USER,
                            transactionId: v4().slice(25),
                            message: "ECONOCOMPRAS",
                            value: userData.demand_total,
                        });
                
                        const qrCode = await payload.base64();
    
                        const [ resourceType, base64String ] = qrCode.split(',');
    
                        await this.sendMessageMediaMedia(user.id,'image/jpg',base64String,'image.jpg');
    
                        await this.say(user.id,'Após efetuar o pagamento, por gentileza envie um print do comprovante 😁');

                        return

                    }

                    await demandService.createDemand({
                        cartId: cart.id,
                        deliveryMethod: userData.delivery_method,
                        paymentMethod: userData.payment_method,
                        exchange: userData?.exchange_value,
                        observation: userData?.observation,
                        total: userData.demand_total
                    });

                    await cartService.partialUpdate(user.id,{
                        cartStatus:'ANÁLISE'
                    });

                    userStateInMemoryRepository.setState(user.id,"FINALLY");

                    await this.say(user.id,"Recebemos seu pedido e ele está sendo processado !\nTempo médio para preparação é de 45min ⏱\n\nEconocompras\nNosso negócio é estar com você.")



                },

                "PIX_PROOF": async () => {

                    const isValid = validOptions(['image'],message.type);

                    if( !isValid ){

                       await this.say(user.id,'Por gentileza, envie uma imagem com o seu comprovante de pagamento.');

                       return

                    }

                    await demandService.createDemand({
                        cartId: cart.id,
                        deliveryMethod: userData.delivery_method,
                        paymentMethod: userData.payment_method,
                        exchange: userData?.exchange_value,
                        observation: userData?.observation,
                        total: userData.demand_total
                    });

                    userStateInMemoryRepository.setState(user.id,"FINALLY");

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

                        userStateInMemoryRepository.setState(user.id,"WAITING_MESSAGE_ADRESS")

                        await this.say(user.id,"Por favor, digite o seu novo endereço para entrega");

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"PAYMENT_OPTIONS");

                    await this.say(user.id,'Perfeito ! obrigado por confirmar seu endereço 😍');

                    const { totalShoppingCart } = await cartItemsService.calcItems(cart.id);

                    await this.say(user.id,`Escolha a forma de pagamento desejada:\nTotal do pedido: ${toBRL(totalShoppingCart)}\n\n1 - Dinheiro\n2 - Cartão\n3- PIX`);

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

                        userStateInMemoryRepository.setState(user.id,"CONFIRM_ADRESS")

                        await this.say(user.id,`${user.nome_completo}, você confirma seu endereço para entrega ?\n\nEndereço: ${userInfos.endereco}\nBairro: ${userInfos.bairro}\nNúmero da residência: ${userInfos.numero_casa}\nComplemento: ${userInfos.complemento}\n\nS - Sim, confirmo\nN - Não, está incorreto`);

                        return

                    }

                    userStateInMemoryRepository.setState(user.id,"CONFIRM_DELIVERY_METHOD")

                    userDataInMemoryRepository.setUserData(user.id,{
                        delivery_method:"BUSCAR NA LOJA"
                    });

                    await this.say(user.id,`O nosso endereço é:\nRua Sebastião Lopes de Menzes 90, Biarro Nova Brasília, Campina Grande.`);

                    await this.say(user.id,`${user.nome_completo}, você confirma vir buscar suas compras em nosso endereço?\n\nS - Sim, desejo buscar\nN - Não, prefiro escolher outro método\n${this.defaultMessages.globalConfigs
                    }`);

                },
                

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