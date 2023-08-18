const userService = require("../services/userService");

class UserController {

    async index(req,res){

        const { search, quanty, page} = req.query;

        const users = await userService.getAll({
            search,
            quanty,
            page,
        });;

        res.json(users);

    }

    async show(req,res){

        const { id } = req.params;

        const user = await userService.getOne(id);

        res.json(user);


    }

    async store(req,res){

        const { whatsapp_id, nome_completo } = req.body;

        await userService.create({
            whatsapp_id,
            nome_completo
        });

        res.sendStatus(200);

    }

    async delete(req,res){

        const { id } = req.params;

        await userService.delete(id);

        res.sendStatus(204);

    }

    async update(req,res){

        const { nome_completo  } = req.body;

        const { id } = req.params;

        await userService.update(id,{
            nome_completo
        });

        res.sendStatus(200);


    }

}

module.exports = new UserController();