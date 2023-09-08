const userInfosService = require("../services/userInfosService");

class UserInfosController {

    async show(req,res){

        const { id } = req.params;

        const userInfos = await userInfosService.getOne(id);

        res.json(userInfos);

    }

    async create(req,res){

        const { userId, phone, adress, neighborhood, houseNumber, complement } = req.body;

        await userInfosService.insertInfos({
            userId, phone, adress, neighborhood, houseNumber, complement
        });

        res.sendStatus(200);

    }

    async partialUpdate(req,res){

        const id = req.params;

        const { phone, adress, neighborhood, houseNumber, complement } = req.body;

        await userInfosService.partialUpdate(id,{
            numero_telefone: phone, 
            endereco: adress, 
            bairro: neighborhood, 
            numero_casa: houseNumber, 
            complemento: complement
        });

        res.sendStatus(200);

    }

}

module.exports = new UserInfosController();