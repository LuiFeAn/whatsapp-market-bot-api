const query = require("../database/mysql-async");

class DemandRepository {

    create({ cartId, deliveryMethod, paymentMethod, observation, total, exchange }){

        return query('ECONOBOT',{
            query:'INSERT INTO pedidos (carrinho_id, metodo_entrega, metodo_pagamento, observacao, total, troco) VALUES (?,?,?,?,?,?);',
            values:[cartId,deliveryMethod,paymentMethod,observation,total,exchange]
        });

    }
    
    delete(cart_id){

        return query('ECONOBOT',{
            query:'DELETE FROM pedidos WHERE id = ?',
            values:[cart_id]
        });

    }

}

module.exports = new DemandRepository();