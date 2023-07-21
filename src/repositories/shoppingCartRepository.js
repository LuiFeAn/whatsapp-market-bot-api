const query = require("../database/mysql-async");


class ShoppingCartRepository {

    async insertToShoppingCart({ usuario_id, produto_id, quantidade }){

        query('ECONOBOT',{
            query:'INSERT INTO usuario_carrinho VALUES (NULL,?,?,?)',
            values:[usuario_id,produto_id,quantidade]
        });

    }

    getShoppingCart(id){

        return query('ECONOBOT',{
            query:`
            
                SELECT 
                usuario_carrinho.id AS item_carrinho_id, usuario_carrinho.quantidade,
                produtos.produto,produtos.preco 
                FROM usuario_carrinho
                JOIN produtos ON produtos.id = usuario_carrinho.produto_id
                WHERE usuario_carrinho.usuario_id = ?
            
            `,
            values:[id]
        });
        
    }

}

module.exports = new ShoppingCartRepository();