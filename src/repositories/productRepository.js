const query = require('../database/mysql-async');
const dotenv = require('dotenv');

dotenv.config();

class ProductRepository {

    findAll({descricao,codigo_barras}){

        return query('ECONOBOT',{
            query: 'SELECT * FROM produtos WHERE Descricao LIKE ? OR Codigo_Barra LIKE ? LIMIT 30',
            values:[`%${descricao}%`,`${codigo_barras}%`]
        })

    }

    async update(id){
        
    }

}

module.exports = new ProductRepository();