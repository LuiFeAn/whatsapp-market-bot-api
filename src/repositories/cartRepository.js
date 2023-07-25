const query = require("../database/mysql-async");

class CartRepository {

    async create(user_id){


        query("ECONOBOT",{
            query:'INSERT INTO carrinhos VALUES (NULL,?,?)',
            values:[user_id,'ABERTO']
        });

    }

    async remove(user_id){

        query("ECONOBOT",{
            query:'REMOVE FROM carrinhos WHERE usuario_id = ?',
            values:[user_id]
        });


    }

}

module.exports = new CartRepository();