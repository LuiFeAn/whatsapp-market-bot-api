const demandRepository = require("../repositories/demandRepository");

class DemandService {

    getAllDemands(){

        const demands = demandRepository.findAll();

        return demands;

    }

    async partialUpdate({ id, status }){

        if( status ){

            await demandRepository.updateStatus(id,status);

        }

    }

}

module.exports = new DemandService();