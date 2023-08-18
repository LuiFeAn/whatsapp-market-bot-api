const { query } = require('express-validator');


module.exports = {

    get:[
        query('type').notEmpty().withMessage('Necessário informar o tipo'),
        query('quanty').notEmpty().withMessage('Necessário informar a quantidade').customSanitizer( 
            value => Number(value)),
        query('page').notEmpty().withMessage('Necessário informar a página').customSanitizer( 
            value => Number(value))
    ]

}