const query = require('../infra/mysql-async');
const dotenv = require('dotenv');

dotenv.config();

class ProductRepository {

    findAll(product){

        return query('ECONOCOMPRAS',{
            query: process.env.ECONOCOMPRAS_SELECT_PRODUCT_QUERY,
            values:[product]
        })

    }

}

module.exports = new ProductRepository();