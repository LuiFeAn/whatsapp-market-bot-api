const deliveryFeeRepository = require('../repositories/deliveryFeeRepository');


class DeliveryFeeService {

    find(){

        return deliveryFeeRepository.findAll();

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