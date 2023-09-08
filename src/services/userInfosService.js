const userInfosRepository = require("../repositories/userInfosRepository");
const ApiError = require("../errors/defaultError");

class UserInfosService {

    async getOne(id){

        const [ userInfos ] = await userInfosRepository.findOne({
            userId: id
        });

        return userInfos;

    }

    async insertInfos({whatsappId, contactNumber, phone, adress, neighborhood, houseNumber, complement}){
        
        const userInfos = await this.getOne(whatsappId);

        if( userInfos ){

            throw new ApiError({
                statusCode:409,
                errors:[
                    "Informações já existentes"
                ]
            });

        }

        return userInfosRepository.insertInfos({
            usuario_id: whatsappId, numero_telefone: contactNumber, endereco: adress, bairro: neighborhood, numero_casa: houseNumber, complemento: complement
        });


    }

    async partialUpdate(id,{cellPhone, adress, neighborhood, houseNumber, complement}){

        const userInfos = await this.getOne(id);

        if( !userInfos ){

            await this.insertInfos({
                whatsappId:id,
                contactNumber: cellPhone,
                adress,
                neighborhood,
                houseNumber,
                complement
            });

            return

        }

        if( cellPhone ){

            await userInfosRepository.updatePhoneNumber(id,cellPhone);

        }

        if( adress ){

            await userInfosRepository.updateAdress(id,adress);

        }

        if( neighborhood ){

            await userInfosRepository.updateNeighBorHood(id,neighborhood);

        }

        if( houseNumber ){

            await userInfosRepository.updateHouseNumber(id,houseNumber);

        }

        if( complement ){

            await userInfosRepository.updateComplement(id,complement);

        }

    }

}

module.exports = new UserInfosService();