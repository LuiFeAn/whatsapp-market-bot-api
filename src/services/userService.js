const userRepository = require("../repositories/userRepository");
const ApiError = require("../errors/defaultError");

class UserService {

    async getAll({search,quanty,page}){

        let offset = 0;

        if( page > 1 ){

            offset = (page - 1) * Number(quanty);

        }

        const users = await userRepository.findAll({
            search,
            quanty,
            page
        });

        return users;

    }

    async create({ whatsapp_id, nome_completo }){

        const user = await this.getOne(whatsapp_id);

        if( user ){

            throw new ApiError({
                statusCode:409,
                errors:[
                    'Usuário já cadastrado'
                ]
            });

        }

        return userRepository.insertUser({
            whatsapp_id,
            nome_completo
        });

    }

    async getOne(userId){

        const users = await userRepository.findOne(userId);

        return users;

    }

    async delete(userId){

        return userRepository.delete(userId);

    }

    async update(id,{ nome_completo }){

    
        await userRepository.update(id,{
            nome_completo
        })


    }



}

module.exports = new UserService();