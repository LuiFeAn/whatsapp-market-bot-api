const query = require("../database/mysql-async");


class ShoppingCartRepository {

    insertToShoppingCart({ usuario_id, nome_produto,valor_produto, quantidade }){

        return query('ECONOBOT',{
            query:'INSERT INTO usuario_carrinho VALUES (NULL,?,?,?,?)',
            values:[usuario_id,nome_produto,valor_produto,quantidade]
        });

    }

    getShoppingCart(id){

        return query('ECONOBOT',{
            query:`
            
                SELECT 
                *
                FROM usuario_carrinho
                WHERE usuario_id = ?
            
            `,
            values:[id]
        });
        
    }

    async getOneItemFromShoppingCart(usuario_id,nome_produto){

        const [ result ] = await query('ECONOBOT',{
            query:'SELECT * FROM usuario_carrinho WHERE usuario_id = ? AND nome_produto = ?',
            values:[usuario_id,nome_produto]
        });

        return result;

    }

    removeItemFromShoppingCart(usuario_id,nome_produto){

        return query('ECONOBOT',{
            query:'DELETE FROM usuario_carrinho WHERE usuario_id = ? AND nome_produto = ?',
            values:[usuario_id,nome_produto]
        });

    }

    removeAllItemsFromShoppingCart(usuario_id){

        return query('ECONOBOT',{
            query:'DELETE FROM usuario_carrinho WHERE usuario_id = ?',
            values:[usuario_id]
        });

    }

}

module.exports = new ShoppingCartRepository();