const demandRepository = require("../repositories/demandRepository");
const clearMemoryService = require("../services/clearMemoryService");
const bot = require("../index");

class DemandService {

    async getAll({ userId }){

        let demands = [];

        if( userId ){

            demands = await demandRepository.findAllFromUser(userId);

            return demands;

        }

        demands = await demandRepository.findAll();

        return demands

    }

    async partialUpdate({ id, status }){

        status.toUpperCase();

        const demand = await this.getDemand(id);

        if( status ){

            if( status === 'RECUSADO' ){

                clearMemoryService.clearUserLastProductAndList(demand.usuario_id);

                await bot.say(demand.usuario_id,`${demand.usuario_id}, infelizmente seu pedido foi recusado.`);

                await demandRepository.updateStatus(id,'PEDIDO RECUSADO');

                return

            }

            if( status === 'APROVADO' ){

                await bot.say(demand.usuario_id,`${demand.usuario_id}, Seu pedido foi aceito e já se encontra em fase de separação ! 😍.`);

                await demandRepository.updateStatus(id,'EM FASE DE SEPARAÇÃO');

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