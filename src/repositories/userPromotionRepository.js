const query = require('../database/mysql-async');

class UserPromotionRepository {

    findOne(userId){

        return query('ECONOBOT',{
            query:'SELECT * FROM aceita_promocoes WHERE usuario_id = ?',
            values:[userId]
        });

    }

    create(userId){

        return query('ECONOBOT',{
            query:'INSERT INTO aceita_promocoes VALUES(NULL,?)',
            values:[userId]
        });

    }

    delete(userId){

        return query('ECONOBOT',{
            query:'DELETE FROM aceita_promocoes WHERE usuario_id = ?',
            values:[userId]
        });

    }

}

module.exports = new UserPromotionRepository();