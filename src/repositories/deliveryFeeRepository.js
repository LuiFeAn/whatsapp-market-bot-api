const query = require('../database/mysql-async');


class DeliveryFeeRepository {


    findAll(){

        return query('ECONOBOT',{
            query:'SELECT * FROM taxa_entrega',
            values:[]
        })

    }

    findOne(userId){

        return query('ECONOBOT',{
            query:'SELECT * FROM taxa_entrega WHERE usuario_id = ?',
            values:[userId]
        })

    }

    create({ kmMaximo, kmFrete, taxa }){

        return query('ECONOBOT',{
            query:'INSERT INTO taxa_entrega VALUE(NULL,?,?,?)',
            values:[kmMaximo,kmFrete,taxa]
        });

    }

   updateMaxKm(id,maxKm){

        return query('ECONOBOT',{
            query:'UPDATE taxa_entrega SET km_maximo = ? WHERE id = ?',
            values:[maxKm,id]
        })

   }

   updateFeeKm(id,freeKm){

        return query('ECONOBOT',{
            query:'UPDATE taxa_entrega SET km_frete = ? WHERE id = ?',
            values:[freeKm,id]
        })

   }

   updateRate(id,rate){

        return query('ECONOBOT',{
            query:'UPDATE taxa_entrega SET taxa = ? WHERE id = ?',
            values:[rate,id]
        })

   }

}

module.exports = new DeliveryFeeRepository();