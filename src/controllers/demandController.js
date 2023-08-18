delete require.cache[require.resolve('../services/demandService')];

const demandService = require('../services/demandService');

class DemandController {

    async index(req,res){

        const { userId, type, date, quanty, page } = req.query;

        const demands = await demandService.getAll({
            userId,
            type,
            date,
            bot: false,
            quanty,
            page,
        });

        res.json(demands);

    }

    async partialUpdate(req,res){

        const { id } = req.params;

        const { status, reason } = req.body;

        await demandService.partialUpdate({
            id,
            status,
            reason
        });

        res.sendStatus(200);
        
    }

}

module.exports = new DemandController();