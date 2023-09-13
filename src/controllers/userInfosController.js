const userInfosService = require("../services/userInfosService");

class UserInfosController {

    async show(req,res){

        const { id } = req.params;

        const userInfos = await userInfosService.getOne(id);

        res.json(userInfos);

    }

    async create(req,res){

        await userInfosService.insertInfos(req.body);

        res.sendStatus(200);

    }

    async partialUpdate(req,res){

        const { id } = req.params;

        await userInfosService.partialUpdate(id,req.body);

        res.sendStatus(200);

    }

}

module.exports = new UserInfosController();