const demandRepository = require("../repositories/demandRepository");

class DemandService {

    getAllDemands(){

        const demands = demandRepository.findAll();

        return demands;

    }

    async partialUpdate({ status }){

        if( status ){

            await demandRepository.updateStatus(status);

        }

    }

}

module.exports = new DemandService();