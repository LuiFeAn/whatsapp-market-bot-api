const userService = require("../services/userService");

class UserController {

    async index(req,res){

        const { search, quanty, page, contacts, withPromotion } = req.query;

        const users = await userService.getAll({
            search,
            quanty,
            contacts,
            withPromotion,
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

        const { whatsappId, fullName } = req.body;

        await userService.create({
            whatsappId,
            fullName
        });

        res.sendStatus(200);

    }

    async delete(req,res){

        const { id } = req.params;

        await userService.delete(id);

        res.sendStatus(204);

    }

    async update(req,res){

        const { fullName  } = req.body;

        const { id } = req.params;

        await userService.update(id,{
            fullName
        });

        res.sendStatus(200);


    }

}

module.exports = new UserController();