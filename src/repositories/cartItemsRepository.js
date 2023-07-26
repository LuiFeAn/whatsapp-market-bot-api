const query = require("../database/mysql-async");

class CartItemsRepository {

    async add({cart_id,product_name,product_value,quanty}){

        query("ECONOBOT",{
            query:"INSERT INTO carrinho_items VALUES (NULL,?,?,?,?)",
            values:[cart_id,product_name,product_value,quanty]
        })

    }

    async remove(cart_id,id){

        query("ECONOBOT",{
            query:"DELETE FROM carrinho_items WHERE carrinho_id = ? AND id = ?",
            values:[cart_id,id]
        });

    }

    async find(cart_id,product_name){

        return query("ECONOBOT",{
            query:"SELECT * FROM carrinho_items WHERE carrinho_id = ? AND nome_produto = ?",
            values:[cart_id,product_name]
        });

    }

    async findAll(cart_id){

        return query("ECONOBOT",{
            query:"SELECT * FROM carrinho_items WHERE carrinho_id = ?",
            values:[cart_id]
        });        

    }

    removeAll(cart_id){

        query("ECONOBOT",{
            query:"DELETE FROM carrinho_items WHERE carrinho_id = ?",
            values:[cart_id]
        });        

    }

}

module.exports = new CartItemsRepository();