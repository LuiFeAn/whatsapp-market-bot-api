const query = require("../database/mysql-async");

class BookletRepository {

    async findAll(){

        return query('ECONOBOT',{
            query:'SELECT * FROM encartes',
            values:[]
        });

    }

    async insert(bookletPath){

        return query('ECONOBOT',{
            query:'INSERT INTO encartes VALUES (NULL,?)',
            values:[bookletPath]
        });

    }

    async delete(bookletId){

        return query('ECONOBOT',{
            query:'DELETE FROM encartes WHERE id = ?',
            values:[bookletId]
        });

    }

}

module.exports = new BookletRepository();