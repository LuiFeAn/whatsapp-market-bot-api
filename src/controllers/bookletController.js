const bookletService = require("../services/bookletService");

class BookletController {

    async index(req,res){

        const booklets = await bookletService.getAllBooklets();

        res.json(booklets);

    }

    async create(req,res){

        const host = req.get('host');

        const { mensagem } = req.body;

        await bookletService.insertBooklet({
            currentHost: host,
            message: mensagem,
            bookletPath: req.file.filename,
            protocol: req.protocol
        });

        res.sendStatus(204);

    }
    
    async delete(req,res){

        const { id } = req.params;

        await bookletService.deleteBooklet(id);

        res.sendStatus(204);

    }

}

module.exports = new BookletController();