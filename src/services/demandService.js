const demandRepository = require("../repositories/demandRepository");

class DemandService {

    getAllDemands(){

        const demands = demandRepository.findAll();

        return demands;

    }

}

module.exports = new DemandService();