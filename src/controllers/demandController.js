delete require.cache[require.resolve('../services/demandService')];

const demandRepository = require("../services/demandService");

class DemandController {

    async index(req,res){

        const { usuario_id, tipo, data, quantidade, pagina } = req.query;

        const demands = await demandRepository.getAll({
            userId: usuario_id,
            type: tipo,
            date: data,
            quanty: quantidade,
            page: pagina
        });

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