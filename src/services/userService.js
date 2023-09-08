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
        withPromotion
    }){

        let offset = 0;

        [ contacts, withPromotion ] = [ contacts, withPromotion ].map( query => JSON.parse(query));

        page--;

        if( page > 1 ){
            
            offset = page * Number(quanty);

        }

        let users = [];

        if( contacts ){

            users = await bot.client.getContacts();

            users = users.map(function(user){

                return {
                    id: user.id._serialized,
                    nome_completo: user.name,
                }

            });

            if( search){

                users = users.filter( user => (
                    user.nome_completo?.toLowerCase().includes(search.toLowerCase()))
                );

            }
                
            users = pagination({
                items: users,
                itemsPerPage: quanty
            });

            return users[page];


        }

        users = await userRepository.findAll({
            search,
            quanty,
            page,
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

    async update(id,{ fullName }){

    
        await userRepository.update(id,{
            nome_completo: fullName
        })


    }



}

module.exports = new UserService();