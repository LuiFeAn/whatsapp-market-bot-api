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

    async remove(user_id){

        return query("ECONOBOT",{
            query:'REMOVE FROM carrinhos WHERE usuario_id = ?',
            values:[user_id]
        });


    }

}

module.exports = new CartRepository();