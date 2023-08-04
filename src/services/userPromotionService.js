const userPromotionRepository = require('../repositories/userPromotionRepository');

class UserPromotionService {

    async getPromotion(userId){

        const [ promotion ] = await userPromotionRepository.findOne(userId);

        return promotion

    }

    async acceptPromotion(userId){

        const promotion = await this.getPromotion(userId);

        if( promotion ){
            ///
        }

        return userPromotionRepository.create(userId);

    }

    removePromotion(userId){

        return userPromotionRepository.delete(userId);

    }

}

module.exports = new UserPromotionService();