const deliveryFeeRepository = require('../repositories/deliveryFeeRepository');


class DeliveryFeeService {

    async findOne(userId){

        const [ deliveryFee ] = await deliveryFeeRepository.findOne(userId);

        return deliveryFee;

    }

    async partialUpdate({ kmMaximo, kmFrete, taxa }){

        if( kmMaximo ){

            await deliveryFeeRepository.updateMaxKm(kmMaximo);

            return

        }

        if( kmFrete ){

            await deliveryFeeRepository.updateFeeKm(kmFrete);

        }

        if( taxa ){

            await deliveryFeeRepository.updateRate(taxa);

        }

    }

    

}

module.exports = new DeliveryFeeService();