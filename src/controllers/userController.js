const userService = require("../services/userService");

class UserController {

    async index(req,res){

        const users = await userService.getAll(req.query);;

        res.json(users);

    }

    async show(req,res){

        const user = await userService.getOne(req.params.id);

        res.json(user);


    }

    async store(req,res){

        await userService.create(req.body);

        res.sendStatus(200);

    }

    async delete(req,res){

        await userService.delete(req.params.id);

        res.sendStatus(204);

    }

    async partialUpdate(req,res){

        await userService.partialUpdate(req.params.id,req.body);

        res.sendStatus(200);


    }

}

module.exports = new UserController();