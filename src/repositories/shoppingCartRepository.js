const query = require("../database/mysql-async");


class ShoppingCartRepository {

    async insertToShoppingCart({ usuario_id, nome_produto,valor_produto, quantidade }){

        query('ECONOBOT',{
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

    async removeItemFromShoppingCart(usuario_id,nome_produto){

        query('ECONOBOT',{
            query:'DELETE FROM usuario_carrinho WHERE usuario_id = ? AND nome_produto = ?',
            values:[usuario_id,nome_produto]
        });

    }

    async removeAllItemsFromShoppingCart(usuario_id){

        query('ECONOBOT',{
            query:'DELETE FROM usuario_carrinho WHERE usuario_id = ?',
            values:[usuario_id]
        });

    }

}

module.exports = new ShoppingCartRepository();