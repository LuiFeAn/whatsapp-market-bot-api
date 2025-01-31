const query = require('../database/mysql-async');
const dotenv = require('dotenv');

dotenv.config();

class ProductRepository {

    findAll({descricao,codigo_barras}){

        return query('ECONOBOT',{
            query: 'SELECT * FROM produtos WHERE Descricao LIKE ? OR Codigo_Barra LIKE ?',
            values:[`%${descricao}%`,`${codigo_barras}%`]
        })

    }

    update(id){
        
    }

}

module.exports = new ProductRepository();