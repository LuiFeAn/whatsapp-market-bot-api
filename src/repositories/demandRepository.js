const query = require("../database/mysql-async");

class DemandRepository {

    commonSelectQuery

    constructor(){

        this.commonSelectQuery = `
            SELECT
            usuarios.id as usuario_id, 
            usuarios.nome_completo,
            carrinhos.id as carrinho_id,
            usuario_informacoes.numero_telefone,
            usuario_informacoes.endereco,
            usuario_informacoes.bairro,
            usuario_informacoes.numero_casa,
            usuario_informacoes.complemento,
            pedidos.id as demand_id,
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
            ON usuario_informacoes.usuario_id = carrinhos.usuario_id
        `

    }

    create({ cartId, deliveryMethod, paymentMethod, observation, total, exchange }){

        return query('ECONOBOT',{
            query:'INSERT INTO pedidos (carrinho_id, metodo_entrega, metodo_pagamento, observacao, total, troco) VALUES (?,?,?,?,?,?);',
            values:[cartId,deliveryMethod,paymentMethod,observation,total,exchange]
        });

    }


    findAllBot({ userId }){

        return query('ECONOBOT',{
            query: `${this.commonSelectQuery} WHERE carrinhos.usuario_id = ?`,
            values:[userId]
        });

    }


    findAll({ type, userId, date, quanty, offset }){

        const restOfParams = [];

        let restOfQuery = '';

        if( userId ){

            restOfQuery = 'AND carrinhos.usuario_id = ?';

            restOfParams.push(userId);

        }

        if( date ){

            restOfQuery = 'AND DATE(pedidos.horario) = ?';

            restOfParams.push(date)

        }

        return query('ECONOBOT',{
            query: `${this.commonSelectQuery} WHERE pedidos.status = ? ${restOfQuery} LIMIT ? OFFSET ? `,
            values:[type,...restOfParams,quanty,offset]
        });

    }


    findOne({ demandId, cartId }){

        return query('ECONOBOT',{
            query: `${this.commonSelectQuery} WHERE pedidos.id = ? OR carrinho_id = ?`,
            values:[demandId,cartId]
        });

    }
    
    delete(cart_id){

        return query('ECONOBOT',{
            query:'DELETE FROM pedidos WHERE id = ?',
            values:[cart_id]
        });

    }

    updateStatus(demandId,demandStatus){

        return query('ECONOBOT',{
            query:'UPDATE FROM pedidos SET status = ? WHERE id = ?',
            values:[demandId,demandStatus]
        });

    }

}

module.exports = new DemandRepository();