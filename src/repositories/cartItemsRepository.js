const query = require("../database/mysql-async");

class CartItemsRepository {

    add({cart_id,product_name,product_value,quanty}){

        return query("ECONOBOT",{
            query:"INSERT INTO carrinho_items VALUES (NULL,?,?,?,?)",
            values:[cart_id,product_name,product_value,quanty]
        })

    }

    remove(cart_id,id){

        return query("ECONOBOT",{
            query:"DELETE FROM carrinho_items WHERE carrinho_id = ? AND id = ?",
            values:[cart_id,id]
        });

    }

    find(cart_id,product_name){

        return query("ECONOBOT",{
            query:"SELECT * FROM carrinho_items WHERE carrinho_id = ? AND nome_produto = ?",
            values:[cart_id,product_name]
        });

    }

    findAll(cart_id){

        return query("ECONOBOT",{
            query:"SELECT * FROM carrinho_items WHERE carrinho_id = ?",
            values:[cart_id]
        });        

    }

    removeAll(cart_id){

        return query("ECONOBOT",{
            query:"DELETE FROM carrinho_items WHERE carrinho_id = ?",
            values:[cart_id]
        });        

    }

    updateItem({ cart_id,item_id, quanty }){

        return query("ECONOBOT",{
            query:"UPDATE carrinho_items SET quantidade = ? WHERE id = ? AND carrinho_id = ?",
            values:[quanty,item_id,cart_id]
        }); 

    }

}

module.exports = new CartItemsRepository();