
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
const userLastMessageInMemoryRepository = require('../repositories/inMemory/userLastMessageInMemoryRepository');
const userStateInMemoryRepository = require("../repositories/inMemory/userStateInMemoryRepository");

const clearMemoryService = require("../services/clearMemoryService");

class Econobot {

    client

    botName

    defaultMessages

    currentNumber

    constructor({ client, botName }){

        this.botName = botName

        this.client = client;

        this.defaultMessages = {
            selectMenuOption:`*A cada etapa algumas opções serão apresentadas para você, e basta você responder com o número ou a letra da a opção desejada*\n\nVocê também pode digitar a qualquer momento as palavras chave *"ver carrinho" para gerencia-lo* e *"finalizar atendimento" para encerrar seu atendimento.*`,
            initialMenu:'*Escolha a opção desejada*\n1 - Fazer pedido',
            menuCheckout:"*O que deseja fazer ? digite a opção desejada.*\n\n1 - Pesquisar novo(s) produto(s)\n2 - Deletar Produto\n3 - Alterar quantidade de produto\n4 - Limpar carrinho\n5 - Finalizar pedido",
            paymentMenu:"",

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

        await this.say(media);

    }

    async handleMessage(message){

        try {

            this.currentNumber = message.from;

            const lowerMessage = message.body.toLowerCase();

            const userLastMessage = userLastMessageInMemoryRepository.findLastMessage(this.currentNumber);

            if( !userLastMessage ){

                userLastMessageInMemoryRepository.addLastMessage(this.currentNumber);

            }

            userLastMessageInMemoryRepository.updateLastMessage(this.currentNumber,new Date());

            const botBusy = botBusyRepository.findOne(this.currentNumber);;

            if( !botBusy ){

                botBusyRepository.add(this.currentNumber);

            }

            if( botBusy && botBusy.isBusy ){

                return

            }

            const user = await userRepository.findOne({
                id: this.currentNumber
            });

        
            if( !user ){

                const userInMemory = userFormInMemoryRepository.findOne(this.currentNumber);

                if( !userInMemory ){

                    const newInMemoryUser = new UserInfosForm(message.from,'WAITING_MESSAGE_NAME');

                    userFormInMemoryRepository.insert(newInMemoryUser);;

                    await this.say(`Olá ! me chamo ${this.botName} e sou o assistente virtual do ECONOCOMPRAS ! 😁🤖✌`);
        
                    await this.say('Notei que você é novo por aqui. Por tanto, para eu iniciar seu atendimento, peço que por gentileza me forneça algumas informações !');
        
                    await this.say('Primeiramente, qual é seu nome completo ? 👀');

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

                        await this.say('Agora peço me informe o seu telefone para contato 📳');

        
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
        
                        await this.say('E por último, mas não menos importante: seu endereço 📬');

        
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
                        
                        userStateInMemoryRepository.addState(user.id,"CHOOSE_MENU_OPTION");
        
                        await this.say('Perfeito ! seu cadastro está completo 😎😆');

                        await this.say(this.defaultMessages.selectMenuOption);

                        userFormInMemoryRepository.delete(this.currentNumber);
                        
        
                    },
                    
        
                }
        
                return await handleUserRegisterSteps[userInMemory.current_step]();
        
            }

            const userState = userStateInMemoryRepository.findState(user.id);

            console.log(userState);

            if( !userState ){

                userStateInMemoryRepository.addState(user.id);

                await this.say(`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁. Como posso ajudar ?`)

                await this.say(this.defaultMessages.selectMenuOption);

                await this.say(this.defaultMessages.initialMenu);

                return;


            }

            if(['v','voltar'].includes(lowerMessage)){

                const lastState = userStateInMemoryRepository.findState(user.id);

                const { state_historic } = lastState;

                //Pega o ultimo item da lista novamente

                const lastStateHistoric = state_historic[ state_historic.length - 1];

                if( lastStateHistoric === 'CHOOSE_MENU_OPTION' ){

                    await this.say('Você já se encontra no menu inicial 😉');

                    return

                }

                //Se voltar, retirar o último registro da lista...

                state_historic.pop();

                const lastStateVerificator = {

                    "CHOOSE_MENU_OPTION": `Você voltou para a aba de menu principal.\n${this.defaultMessages.initialMenu}`,
                    "SEARCH_PRODUCT": 'Você voltou para a aba de busca de produtos.\nPor favor, busque por algum item',
                    "CHOOSE_ITEM":"Você voltou para a aba de seleção de produtos. Por favor, selecione novamente algum produto da lista.",
                    "SELECT_PRODUCT_QUANTY":`Você voltou para a aba de seleção de quantidade. Por favor, selecione novamente a quantidade desejada para o item ao qual você selecionou`,
                    "USER_SHOPPING_MANAGER_OPTIONS":`Você voltou para o menu checkout. ${this.defaultMessages.checkoutMenu}`,
                    "PAYMENT_OPTIONS":`Você voltou para o menu de pagamento.\n${this.defaultMessages.paymentMenu}`

                }

                userStateInMemoryRepository.updateState(user.id,lastStateHistoric);

                await this.say(lastStateVerificator[lastStateHistoric]);

                return

            }

            if(['vom','voltar ao menu'].includes(lowerMessage)){

                userStateInMemoryRepository.updateState(user.id,'CHOOSE_MENU_OPTION');

                itemsListInMemoryRepository.removeItemsList(user.id);

                await this.say('Certo, você foi redirecionado ao menu inicial 😉');

                await this.say(this.defaultMessages.initialMenu);

                return

            }


            if(['c','ver carrinho'].includes(lowerMessage)){

                await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

                const userShoppingCart = await shoppingCartService.calcUserTotalShoppingCart(user.id);

                if( userShoppingCart.length === 0 ){

                    await this.say('Ops... parece que no momento você não tem nenhum item no seu carrinho 👀\n Que tal adicionar alguns itens?');

                    return

                }

                const {  productsWithCalcPerItem, totalShoppingCart } = userShoppingCart;

                userStateInMemoryRepository.updateState(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

                for await( const product of productsWithCalcPerItem ){

                    await this.say(`*ID: ${product.produto_id}\nProduto: ${product.nome_produto}* *${product.quantidade}* *UND X ${toBRL(product.valor_produto)} - ${toBRL(product.total)}*`);

                }

                await this.say(`*Valor total ${toBRL(totalShoppingCart)}*`);

                await this.say(this.defaultMessages.menuCheckout);
                

                return

            }

            if(['fa','finalizar atendimento'].includes(lowerMessage)){

                userStateInMemoryRepository.updateState(user.id,null);

                clearMemoryService.clearUserLastProductAndList(user.id);
                
                await this.say(`Certo. Até breve, ${user.nome_completo} !`)
        
                return

            
            }

            
            const handleUserState = {

                'CHOOSE_MENU_OPTION': async () => {

                    const validOptions = ['1'];

                    const handleMenuOption = {

                        '1': async () => {

                            userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                            await this.say(`Vamos lá ! digite o nome do produto desejado.`)

                        },

                        'default': async () => {

                            await message.reply('Opção inválida ! Por favor, selecione uma opção válida.\n1 - Fazer pedido')

                        },

                    }

                    const validOption = validOptions.find( option => option === message.body );

                    handleMenuOption[ validOption || 'default' ]();

                },

                'SEARCH_PRODUCT': async () => {

                    // Busca os produtos no banco de dados original ECONOCOMPRAS

                    const products = await productRepository.findAll({
                        codigo_barras: message.body,
                        descricao: message.body
                    });

                    //Valida tudo o que é necessário -> O item existe ? há estoque ?

                    if( products.length === 0 ){

                        await message.reply(`Não consegui encontrar o produto desejado. Tente buscar por outro nome, ou se preferir, pesquise por outro produto.`);

                        return

                    }

                    //Adiciona um novo "produto" em memória, que na verdade pe a opçção de não ter encontrado o produto desejado

                    products.push({Descricao:'',precoUnitario:'',Codigo_Barra:''});

                    let productSearchList = 'Foram encontrados os seguintes items referentes a sua pesquisa.\n\n*Digite o número da opção correspondente ao produto*';

                    products.forEach(function(product,id){

                        const index = id+=1;

                        if( product.Descricao && product.precoUnitario ){

                            productSearchList += `\n\n*${index} - ${product.Descricao} - R$ ${product.precoUnitario}*`

                        }

                        if( id === products.length - 1){

                            productSearchList += `\n\n*V - Voltar ao Menu Inicial*`;

                        }

                    });

                    await this.say(productSearchList)

                    userStateInMemoryRepository.updateState(user.id,"CHOOSE_ITEM");

                    itemsListInMemoryRepository.addItemsToList({
                        id: user.id,
                        items: products
                    });


                },

                "CHOOSE_ITEM": async () => {

                    const lastItems = itemsListInMemoryRepository.getItemsList(user.id);

                    if( !lastItems ){

                        await this.say(`Infelizmente ocorreu um erro e não consegui obter a sua última lista de pesquisa 😢. Por gentileza, pesquise novamente algum produto !`);

                        userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                        return

                    }

                    const index = Number(message.body) - 1;

                    const { items } = lastItems;

                    const product = items[index];

                    if( !product ){

                        await message.reply(`Desculpe, mas o item ${message.body} não foi listado. Por favor, selecione algum dos produtos que listei acima`);

                        return

                    }

                    //Verifica se o usuário já possui este produto no carrinho. Se sim, não poderá dar continuidade a adição

                    const userAlreadyHasProduct = await shoppingCartRepository.getOneItemFromShoppingCart(user.id,product.Descricao);

                    if( userAlreadyHasProduct ){

                        await this.say(`${user.nome_completo}, você já possui ${product.Descricao} no seu carrinho.\n\nSe deseja adicionar mais quantidades deste item, digite *carrinho* e selecione a opção correspondente`);

                        return;

                    }

                    userStateInMemoryRepository.updateState(user.id,"SELECT_PRODUCT_QUANTY");

                    await this.say(`Qual a quantidade de "${product.Descricao}" que você gostaria de adicionar ao seu carrinho ?`);

                    userLastSelectedItemInMemoryRepository.addSelectedItem({
                        id: user.id,
                        selected_item: product
                    });


                },

                "SELECT_PRODUCT_QUANTY": async () => {

                    const quanty = Number(message.body);

                    const product = userLastSelectedItemInMemoryRepository.getSelectedItem(user.id);

                    if( !quanty ){

                        await message.reply('Ops ! parece que isso não é um número. Por favor, informe a quantidade de itens que deseja adicionar ao seu carrinho.');

                        return

                    }

                    if( !product ){

                        userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");
                        
                        await this.say(`${user.nome_completo}, Não identifiquei aqui o item ao qual você está se referindo para adicionar esta quantidade.\n\n*Por gentileza, pesquise novamente algum produto para que eu possa prosseguir no seu atendimento !*`);

                        return

                    }

                    const { selected_item } = product;

                    await shoppingCartRepository.insertToShoppingCart({
                        usuario_id: user.id,
                        nome_produto: selected_item.Descricao,
                        valor_produto: selected_item.precoUnitario,
                        quantidade: message.body
                    });

                    userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                    await this.say(`*Perfeito ! adicionei ${message.body}X quantidade(s) de ${selected_item.Descricao.toUpperCase()} ao seu carrinho 😉*"`);

                    clearMemoryService.clearUserLastProductAndList(user.id);

                    await this.say(`Qual(is) o(s) próximo(s) produto(s) que você gostaria de pesquisar?\n\n *Lembrando que você pode digitar "ver carrinho" a qualquer momento para gerenciar seu pedido 🛒`);


                },

                'USER_SHOPPING_MANAGER_OPTIONS': async () => {

                    const valid = [ "1","2","3","4","5"];

                    const handleShoppingOptions = {

                        "1": async () => {

                            userStateInMemoryRepository.updateState(user.id,"SEARCH_PRODUCT");

                            clearMemoryService.clearUserLastProductAndList(user.id);

                            await this.say('Qual o produto que você gostaria de pesquisar?');


                        },

                        "2": async () => {

                            await this.say('Por gentileza, digite o ID do produto que você gostaria de remover do carrinho !');

                            const product = await shoppingCartRepository.getOneItemFromShoppingCart(user.id,message.body);

                            if( !product ){

                                await this.say('Ops... parece que este produto não se encontra no seu carrinho. Por favor, digite o ID do produto que deseja remover do seu carrinho !');

                                return

                            }

                            await shoppingCartRepository.removeItemFromShoppingCart(user.id,message.body);

                            await this.say(`${user.nome_completo}, o "${product.nome_produto}" foi removido com sucesso do seu carrinho !`);

                        },

                        "3": async () => {

                            await this.say('Por gentileza, digite o ID do produto que você gostaria de alterar a quantidade');

                        },

                        "4": async () => {

                            shoppingCartRepository.removeAllItemsFromShoppingCart(user.id);

                        },

                        "5": async () => {

                            userStateInMemoryRepository.updateState(user.id,"CONFIRM_ADRESS");

                            await this.say(`Antes de continuarmos, por favor, confirme se seu endereço está correto:\n\n*${user.endereco}*`);

                            await this.say('Você confirma este endereço ?\n S - Sim\nN - Não');

                        },

                        "default": async () =>{

                            await this.say("Opção inválida !");

                        }

                    }

                    const option = valid.find( option => option.includes(lowerMessage) );

                    handleShoppingOptions[ option ?? 'default']();

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

                            await this.say(`*Envie um PIX no valor de ${toBRL(totalShoppingCart)} para a seguinte chave:*`);

                            await this.say(`*${process.env.ECONOCOMPRAS_PIX_USER}*`);

                            await this.say('*É possível também realizar o pagamento escaneando o qrCode abaixo:*');

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

                            await this.say('Após efetuar o pagamento, por gentileza envie um print do comprovante 😁');

                        },

                        "CONFIRM_ADRESS": async () => {

                            if( lowerMessage.includes('n') ){
                                
                                await this.say('Perfeito ! obrigado por confirmar seu endereço 😍');

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

            this.say('Lamento. Infelizmente um erro interno ocorreu ! Tente novamente mais tarde.');

        }

    }

    async say(message,withDelay = true){

        botBusyRepository.update(this.currentNumber,true);

        if( withDelay ){

            await delay();

        }

        await this.client.sendMessage(this.currentNumber,message);

        botBusyRepository.update(this.currentNumber,false);

    }


}

module.exports.Econobot = Econobot;