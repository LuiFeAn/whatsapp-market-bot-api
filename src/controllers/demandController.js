delete require.cache[require.resolve('../services/demandService')];

const demandService = require('../services/demandService');

class DemandController {

    async index(req,res){

        const { usuario_id, tipo, data, quantidade, pagina } = req.query;

        const demands = await demandService.getAll({
            userId: usuario_id,
            type: tipo,
            date: data,
            bot: false,
            quanty: quantidade,
            page: pagina
        });

        res.json(demands);

    }

    async partialUpdate(req,res){

        const { id } = req.params;

        const { status, motivo } = req.body;

        await demandService.partialUpdate({
            id,
            status,
            motivo
        });

        res.sendStatus(200);
        
    }

}

module.exports = new DemandController();