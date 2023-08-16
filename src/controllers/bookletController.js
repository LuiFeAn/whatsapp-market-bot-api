const bookletService = require("../services/bookletService");

class BookletController {

    async index(req,res){

        const booklets = await bookletService.getAllBooklets();

        res.json(booklets);

    }

    async create(req,res){

        const { file:{ path } } = req;

        const host = req.get('host');

        await bookletService.insertBooklet(host,path);

        res.sendStatus(204);

    }
    
    async delete(req,res){

        const { id } = req.params;

        await bookletService.deleteBooklet(id);

        res.sendStatus(204);

    }

}

module.exports = new BookletController();