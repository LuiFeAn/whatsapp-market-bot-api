const userInfosService = require("../services/userInfosService");

class UserInfosController {

    async show(req,res){

        const { id } = req.params;

        const userInfos = await userInfosService.getOne(id);

        res.json(userInfos);

    }

    async create(req,res){

        const { usuario_id, numero_telefone, endereco, bairro, numero_casa, complemento } = req.body;

        await userInfosService.insertInfos({
            usuario_id, numero_telefone, endereco, bairro, numero_casa, complemento
        });

        res.sendStatus(200);

    }

    async partialUpdate(req,res){

        const id = req.params;

        const { numero_telefone, endereco, bairro, numero_casa, complemento } = req.body;

        await userInfosService.partialUpdate(id,{
            numero_telefone, endereco, bairro, numero_casa, complemento
        });

        res.sendStatus(200);

    }

}

module.exports = new UserInfosController();