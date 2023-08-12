const demandRepository = require("../repositories/demandRepository");
const clearMemoryService = require("../services/clearMemoryService");
const clientRepository = require('../repositories/clientsRepository');
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

    async partialUpdate({ id, status, motivo }){

        status.toUpperCase();

        const demand = await this.getDemand(id);

        if( status ){

            if( status === 'RECUSADO' ){

                clearMemoryService.clearUserLastProductAndList(demand.usuario_id);

                await bot.say(demand.usuario_id,`${demand.usuario_id}, infelizmente seu pedido foi recusado. Motivo: ${motivo}`);

                await demandRepository.updateStatus(id,'RECUSADO');

                return

            }

            if( status === 'APROVADO' ){

                await bot.say(demand.usuario_id,`${demand.usuario_id}, Seu pedido foi aceito e já se encontra em fase de separação ! 😍.`);

                await demandRepository.updateStatus(id,'SEPARAÇÃO');

                return

            }

            if( status === 'SAIU PARA ENTREGA'){

            }

            if( status === 'FINALIZADO' ){

                

            }
    

        }

    }

}

module.exports = new DemandService();