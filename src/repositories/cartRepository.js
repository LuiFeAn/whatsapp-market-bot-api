const query = require("../database/mysql-async");

class CartRepository {

    create(user_id){

        return query("ECONOBOT",{
            query:'INSERT INTO carrinhos VALUES (NULL,?,?)',
            values:[user_id,'ABERTO']
        });

    }

    get(user_id){

        return query('ECONOBOT',{
            query:'SELECT * FROM carrinhos WHERE usuario_id = ?',
            values:[user_id]
        })

    }

    async remove(cart_id){

        return query("ECONOBOT",{
            query:'DELETE FROM carrinhos WHERE id = ?',
            values:[cart_id]
        });


    }

}

module.exports = new CartRepository();