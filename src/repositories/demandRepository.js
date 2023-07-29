const query = require("../database/mysql-async");

class DemandRepository {

    create({ cartId, deliveryMethod, paymentMethod, observation, total, exchange }){

        return query('ECONOBOT',{
            query:'INSERT INTO pedidos (carrinho_id, metodo_entrega, metodo_pagamento, observacao, total, troco) VALUES (?,?,?,?,?,?);',
            values:[cartId,deliveryMethod,paymentMethod,observation,total,exchange]
        });

    }

    findAll(){

        return query('ECONOBOT',{
            query:`

                SELECT
                usuarios.id as usuario_id, 
                usuarios.nome_completo,
                usuario_informacoes.numero_telefone,
                usuario_informacoes.endereco
                pedidos.metodo_entrega,
                pedidos.metodo_pagamento,
                pedidos.observacao,
                pedidos.horario,
                pedidos.total,
                pedidos.troco
                FROM pedidos
                JOIN carrinhos
                ON carrinhos.id = pedidos.carrinho_id
                JOIN usuarios 
                ON usuarios.id = carrinhos.usuario_id
                JOIN usuario_informacoes 
                ON usuario_informacoes.usuario_id = usuarios.id

            `,
            values:[]
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