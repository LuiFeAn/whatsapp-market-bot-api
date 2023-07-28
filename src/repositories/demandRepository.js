const query = require("../database/mysql-async");

class DemandRepository {

    create(cart_id){

        return query('ECONOBOT',{
            query:'INSERT INTO pedidos VALUES (NULL,?)',
            values:[cart_id]
        });

    }
    
    delete(cart_id){

        return query('ECONOBOT',{
            query:'DELETE FROM pedidos WHERE id = ?',
            values:[cart_id]
        });

    }

}

module.exports = new DemandRepository();