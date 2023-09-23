const userRepository = require("../repositories/userRepository");
const ApiError = require("../errors/defaultError");
const pagination = require("../utils/pagination");
const bot = require('../bot');
const formatNumberId = require('../utils/formatNumber');
const dotenv = require('dotenv');

dotenv.config();

class UserService {

    async getAll({
        search,
        quanty = 10,
        page = 1,
        contacts,
        getAll,
        withPromotion
    }){

        let offset = 0;

        if( page > 1 ){
            
            offset = (page - 1) * Number(quanty);

        }

        let users = [];

        if( contacts ){

            try{

                users = await bot.client.getContacts();

            }catch(err){

                return []

            }

            users = users.map(function(user){

                return {
                    usuario_id: user.id._serialized,
                    nome_completo: user.name,
                }

            });

            if( getAll ){

                return users;

            }

            if( search){

                users = users.filter( user => (
                    user.nome_completo?.toLowerCase().trim().includes(search.toLowerCase().trim()))
                );

            }
                
            users = pagination({
                items: users,
                itemsPerPage: quanty
            });

            return users[page - 1];


        }

        users = await userRepository.findAll({
            search,
            quanty,
            getAll,
            page: offset,
            withPromotion
        });

        return users;

    }

    async create({ whatsappId,fullName }){

        const user = await this.getOne(whatsappId);

        if( user ){

            throw new ApiError({
                statusCode:409,
                errors:[
                    'Número de WhatsApp já cadastrado'
                ]
            });

        }

        return userRepository.insertUser({
            whatsapp_id: whatsappId,
            nome_completo: fullName
        });

    }

    async getOne(userId){

        const user = await userRepository.findOne({
            id: userId
        });

        return user;

    }

    async delete(userId){

        return userRepository.delete(userId);

    }

    async partialUpdate(id,{ whatsappId, fullName }){

        if( whatsappId ){

            await userRepository.updateWhatsappId(id,whatsappId);

            id = whatsappId;

        }

        if( fullName ){

            await userRepository.updateUsername(id,fullName);

        }


    }



}

module.exports = new UserService();