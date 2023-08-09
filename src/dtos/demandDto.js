const { query } = require('express-validator');


module.exports = {

    get:[
        query('tipo').notEmpty().withMessage('Necessário informar o tipo'),
        query('quantidade').notEmpty().withMessage('Necessário informar a quantidade').customSanitizer( 
            value => Number(value)),
        query('pagina').notEmpty().withMessage('Necessário informar a página').customSanitizer( 
            value => Number(value))
    ]

}