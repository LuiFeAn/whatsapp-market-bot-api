const demandRepository = require("../repositories/demandRepository");
const cartService = require('../services/userCartService');
const clearMemoryService = require("../services/clearMemoryService");
const clientRepository = require('../repositories/clientsRepository');
const onlyFristName = require('../utils/onlyFirstName');
const userStateInMemoryRepository = require('../repositories/inMemory/userStateInMemoryRepository');
const bot = require("../bot");

class DemandService {

    async getAll({ userId, type, date, page, quanty, bot = true }){

        let offset = 0;

        if( bot ){

            const demands = await demandRepository.findAllBot({
                userId
            });

            return demands;

        }

        if( page > 1 ){

            offset = (page - 1) * Number(quanty);

        }

        const demands = await demandRepository.findAll({
            userId,
            type,
            date,
            quanty,
            offset
        });

        return demands;

    }


    async getOne({ demandId, cartId }){

        const [ demand ] = await demandRepository.findOne({
            demandId,
            cartId
        });

        return demand;

    }

    async createDemand({ cartId, deliveryMethod, paymentMethod, observation, total, exchange }){

        await demandRepository.create({ cartId, deliveryMethod, paymentMethod, observation, total, exchange });

        const clients = clientRepository.allClients();

        clients.forEach(function(client){

            client.emit('new-demand');

        });

    }

    async partialUpdate({ id, status, reason }){

        status = status.toUpperCase();

        const demand = await this.getOne({
            demandId: id
        });

        const userName = onlyFristName(demand.nome_completo);

        const statusHandler = {

            'RECUSADO': async () => {

                clearMemoryService.clearUserLastProductAndList(demand.usuario_id);

                await demandRepository.updateStatus(demand.demand_id,'RECUSADO');

                await bot.say(demand.usuario_id,`${userName}, infelizmente *seu pedido N° ${demand.demand_id} foi recusado*.\nMotivo: ${reason}`);

            },

            'APROVADO': async () => {

                await demandRepository.updateStatus(demand.demand_id,'SEPARAÇÃO');

                await bot.say(demand.usuario_id,`*${userName}, seu pedido N° ${demand.demand_id} foi aceito e está em fase de separação o tempo médio é de 45 min ⏱️*`);

            },

            'RECEBÍVEL': async () => {

                await demandRepository.updateStatus(demand.demand_id,'RECEBÍVEL');

                await bot.say(demand.usuario_id,`*${userName}, seu pedido N° ${demand.demand_id} já pode ser buscado no estabelecimento !*\n\n*O nosso endereço é:*\n*Rua Sebastião Lopes de Menzes 90, Biarro Nova Brasília, Campina Grande.*`);

            },

            'SAIU PARA ENTREGA': async () => {

                await demandRepository.updateStatus(demand.demand_id,'ENTREGA');

                await bot.say(demand.usuario_id,`*${userName}, trago notícias ! seu pedido N° ${demand.demand_id} saiu para entrega e logo estará em suas mãos 😉😎.*\n\n*Por gentileza, aguarde o entregador em frente a sua residência.*`);

            },

            'FINALIZADO': async () => {

                userStateInMemoryRepository.removeState(demand.usuario_id);

                await cartService.partialUpdate(demand.carrinho_id,{
                    cartStatus:'FECHADO'
                });

                await demandRepository.updateStatus(demand.demand_id,'FINALIZADO');

                await bot.say(demand.usuario_id,`*${userName}, seu pedido N° ${demand.demand_id} foi finalizado. Muito obrigado !*\n\n*Econocompras*\n*Nosso negócio é estar com você 😉*`);

            }


        }

        statusHandler[status]();

    }

}

module.exports = new DemandService();