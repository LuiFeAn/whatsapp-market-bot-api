const query = require('../database/mysql-async');
const dotenv = require('dotenv');

dotenv.config();

class ProductRepository {

    findAll({product,codigo_barras}){

        return query('ECONOBOT',{
            query: 'SELECT * FROM produtos WHERE produto LIKE ? OR codigo_barra LIKE ?',
            values:[`${product}%`,`${codigo_barras}%`]
        })

    }

    update(id){
        
    }

}

module.exports = new ProductRepository();