const query = require("../database/mysql-async");

class CartItemsRepository {

    async add({cart_id,product_name,product_value,quanty}){

        query("ECONOBOT",{
            query:"INSERT INTO carrinho_items VALUES (NULL,?,?,?,?)",
            values:[cart_id,product_name,product_value,quanty]
        })

    }

    async remove(user_id,id){

        query("ECONOBOT",{
            query:"DELETE FROM carrinho_items WHERE usuario_id = ? AND id = ?",
            values:[user_id,id]
        });

    }

}

module.exports = new CartItemsRepository();