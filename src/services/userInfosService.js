const userInfosRepository = require("../repositories/userInfosRepository");
const ApiError = require("../errors/defaultError");

class UserInfosService {

    async getOne(id){

        const [ userInfos ] = await userInfosRepository.findOne({
            userId: id
        });

        return userInfos;

    }

    async insertInfos({usuario_id, numero_telefone, endereco, bairro, numero_casa, complemento}){
        
        const userInfos = await this.getOne(usuario_id);

        if( userInfos ){

            throw new ApiError({
                statusCode:409,
                errors:[
                    "Informações já existentes"
                ]
            });

        }

        return userInfosRepository.insertInfos({
            usuario_id, numero_telefone, endereco, bairro, numero_casa, complemento
        });


    }

    async partialUpdate(id,{numero_telefone, endereco, bairro, numero_casa, complemento}){

        const user = await this.getOne(id);

        if( !user ){

            throw new ApiError({
                statusCode:404,
                errors:[
                    "Usuário inexistente"
                ]
            });

        }

        if( numero_telefone ){

            await userInfosRepository.updatePhoneNumber(id,numero_telefone);

        }

        if( endereco ){

            await userInfosRepository.updateAdress(id,endereco);

        }

        if( bairro ){

            await userInfosRepository.updateNeighBorHood(id,bairro);

        }

        if( numero_casa ){

            await userInfosRepository.updatePhoneNumber(id,numero_casa);

        }

        if( complemento ){

            await userInfosRepository.updateComplement(id,complemento);

        }

    }

}

module.exports = new UserInfosService();