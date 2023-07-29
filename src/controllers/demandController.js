const demandRepository = require("../services/demandService");

class DemandController {

    async index(req,res){

        const demands = await demandRepository.getAllDemands();

        res.json(demands);

    }

    async partialUpdate(req,res){

        const { status } = req.body;

        await demandRepository.partialUpdate({
            status
        });

        res.sendStatus(200);
        
    }

}

module.exports = new DemandController();