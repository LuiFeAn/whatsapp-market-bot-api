const demandRepository = require("../services/demandService");

class DemandController {

    async index(req,res){

        const demands = await demandRepository.getAllDemands();

        res.json(demands);

    }

    async partialUpdate(req,res){

        const { id } = req.params;

        const { status } = req.body;

        await demandRepository.partialUpdate({
            id,
            status
        });

        res.sendStatus(200);
        
    }

}

module.exports = new DemandController();