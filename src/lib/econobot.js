
//Utilitários

const delay = require('../utils/delay');
const validPhoneNumber = require('../utils/isAPhoneNumber');
const qrCodeTerminal = require("qrcode-terminal");
const { toBRL } = require('../utils/toBRL');

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

class Econobot {

    client

    botName

    defaultMessages

    currentNumber

    constructor({ client, botName }){

        this.botName = botName

        this.client = client;

        this.defaultMessages = {
            selectMenuOption:'Escolha a opção que deseja: \n1 - Pesquisar Produto(s)'
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

    async handleMessage(message){

        this.currentNumber = message.from;

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
    
                    await this.say('Perfeito ! seu cadastro está completo 😎😆');

                    await this.say(this.defaultMessages.selectMenuOption);

                    userFormInMemoryRepository.delete(user.id);

                    return;
                    
    
                },
                
    
            }
    
            await handleUserRegisterSteps[userInMemory.current_step]();

            return
    
        }

        if( !user.current_step ){

            await this.say(`Olá, ${user.nome_completo} ! Que bom ver você de novo por aqui 😁 \n Com o que posso auxiliar você ? `)

            const userShoppingCart = await shoppingCartRepository.getShoppingCart(user.id);

            if( userShoppingCart.length > 0 ){

                await this.say(`Notei que você tem itens adicionados no seu carrinho !\nDeseja continuar suas compras ?`);

                await userRepository.setCurrentStep(user.id,"SHOPPING_CART_CONTINUE_OPTIONS");

                return

            }

            await this.say(this.defaultMessages.selectMenuOption);

            await userRepository.setCurrentStep(user.id,"CHOOSE_MENU_OPTION");

            return;


        }


        const lowerMessage = message.body.toLowerCase();

        if( lowerMessage.includes("carrinho")){

            await message.reply('Aguarde enquanto busco aqui seu carrinho... É rápidinho ! 😉');

            const userShoppingCart = await shoppingCartRepository.getShoppingCart(user.id);

            if( userShoppingCart.length === 0 ){

                await this.say('Ops... parece que no momento você não tem nenhum item no seu carrinho 👀\n Que tal adicionar alguns itens?');

                return

            }

            await userRepository.setCurrentStep(user.id,"USER_SHOPPING_MANAGER_OPTIONS");

            const productsWithCalcPerItem = userShoppingCart.map( item => ({
                ...item,
                produto: item.produto.toUpperCase(),
                total: ( item.quantidade * item.preco )
            }));

            const totalShoppingCart = productsWithCalcPerItem.reduce((acc,item) => (
                acc + item.total
            ),0);

            for await( const product of productsWithCalcPerItem ){

                await this.say(`*${product.produto}*\n*${product.quantidade}* *UND X ${toBRL(product.preco)} - ${toBRL(product.total)}*`);

            }

            await this.say(`*Valor total ${toBRL(totalShoppingCart)}*`);


            await this.say(`*O que deseja fazer ? digite a opção desejada.*\n\n1 - Pesquisar novo(s) produto(s)\n2 - Deletar Produto\n3 - Alterar quantidade de produto\n4 - Limpar carrinho\n5 - Finalizar pedido`);
            

            return

        }

        if( lowerMessage.includes("finalizar atendimento")){

            await userRepository.setCurrentStep(user.id,null);

            userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

            await this.say(`Certo. Até breve, ${user.nome_completo} !`)
    
            return

        }

        
        const handleUserState = {


            'USER_SHOPPING_MANAGER_OPTIONS': async () => {

                const valid = [ "1","2" ];

                const handleShoppingOptions = {

                    "1": async () => {

                        await userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                        userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);;

                        itemsListInMemoryRepository.removeItemsList(user.id);

                        await this.say('Qual o produto que você gostaria de pesquisar?');


                    },

                    "2": async () => {

                    },

                    "default": async () =>{

                        await this.say("Opção inválida !");

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

                        const userShoppingCart = await shoppingCartRepository.getShoppingCart(user.id);

                        if( userShoppingCart.length === 0 ){

                            await this.say(`${user.nome_completo}, Antes de partir para as compras, irei dar uma breve introdução sobre minhas funcionalidades.\n\nPara adicionar um produto ao seu carrinho, basta digitar o número correspondente do produto na lista para que eu possa identifica-lo.\n\nPara gerênciar seu carrinho, você pode digitar a qualquer momento *carrinho*`)

                            await this.say('Dito isso, qual produto você gostaria de pesquisar ? 😁');


                        }


                    },

                    'default': async () => {

                        await message.reply('Opção inválida ! Por favor, selecione uma opção válida')

                    },

                }

                const validOption = validOptions.find( option => option === message.body );

                handleMenuOption[ validOption || 'default' ]();

            },

            'SEARCH_PRODUCT': async () => {

                await this.say('Aguarde um momento enquanto eu consulto aqui nossas prateleiras 😉 !');

                const products = await productRepository.findAll({
                    codigo_barras: message.body,
                    product: message.body
                });

                if( products.length === 0 ){

                    await message.reply(`Poxa, infelizmente não temos "${message.body}" no momento ! procure por outro produto, ou se preferir, digite "finalizar atendimento" para encerrar seu atendimento 😉`);

                    return

                }


                await Promise.all(products.map(async ( product, id, items )=>{

                    const index = id+=1;

                    await this.say(`Item: ${index}\nProduto: ${product.produto}\nValor: ${toBRL(product.preco.toString())}💰\nCódigo de Barras: ${product.codigo_barra}📊`);

                }));

                await userRepository.setCurrentStep(user.id,"CHOOSE_ITEM");

                itemsListInMemoryRepository.addItemsToList({
                    id: user.id,
                    items: products
                });

                await this.say(`Estes foram todos os resultados que encontrei para "${message.body}"`);

                await this.say(`Digite o *número do item* da lista para que eu possa adicina-lo ao seu carrinho.\nObrigado e boas compras! 🛒✨`);


            },

            "CHOOSE_ITEM": async () => {

                const index = Number(message.body) - 1;

                const lastItems = itemsListInMemoryRepository.getItemsList(user.id);

                if( !lastItems ){

                    await this.say(`Infelizmente ocorreu um erro e não consegui obter a sua lista de pesquisa 😢. Por gentileza, pesquise novamente o produto !`);

                    userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                    return

                }

                await userRepository.setCurrentStep(user.id,"SELECT_PRODUCT_QUANTY");

                const { items } = lastItems;

                if( !items[index] ){

                    await message.reply(`Desculpe, mas o item ${message.body} não foi listado. Por favor, selecione algum dos produtos que listei acima`);

                    return

                }

                await this.say(`Qual a quantidade de "${items[index].produto}" que você gostaria de adicionar ao seu carrinho ?`);

                userLastSelectedItemInMemoryRepository.addSelectedItem({
                    id: user.id,
                    selected_item: items[index]
                });


            },

            "SELECT_PRODUCT_QUANTY": async () => {

                const quanty = Number(message.body);

                const item = userLastSelectedItemInMemoryRepository.getSelectedItem(user.id);

                if( !item ){

                    userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");
                    
                    await this.say(`${user.nome_completo}, Não identifiquei aqui o item ao qual você está se referindo para adicionar esta quantidade.\n\n*Por gentileza, pesquise novamente algum produto para que eu possa prosseguir no seu atendimento !*`);

                    return

                }

                if( !quanty ){

                    await message.reply('Ops ! parece que isso não é um número. Por favor, informe a quantidade de itens que deseja adicionar ao seu carrinho.');

                    return

                }

                const { selected_item:{ id: product_id , produto } } = item

                await shoppingCartRepository.insertToShoppingCart({
                    usuario_id: user.id,
                    produto_id: product_id,
                    quantidade: message.body
                });

                await userRepository.setCurrentStep(user.id,"SEARCH_PRODUCT");

                await this.say(`*Perfeito ! adicionei ${message.body}X quantidade(s) de ${produto.toUpperCase()} ao seu carrinho 😉*"`);

                itemsListInMemoryRepository.removeItemsList(user.id);

                userLastSelectedItemInMemoryRepository.removeSelectedItem(user.id);

                await this.say(`Qual(is) o(s) próximo(s) produto(s) que você gostaria de pesquisar?\n\n *Lembrando que você pode digitar "carrinho" a qualquer momento para gerenciar seu pedido 🛒`);


            },

            "GOTO_PAYMENT": async () => {

                const validPayment = ['1','2'];

                const handlePayment = {

                    '1': async () => {

                        await this.say(`${user.nome_completo}, por favor, confirme se seu endereço está correto:\n\n${user.endereco}`);

                    },

                    '2': async () => {

                    },

                    'default': async () => {

                        message.reply('Opção de pagamento inválida !');

                    }


                }

                const payment = validPayment.find( payment => payment === message.body);

                handlePayment[ payment ?? 'default' ]();

            }

        }

        await handleUserState[user.current_step]();

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