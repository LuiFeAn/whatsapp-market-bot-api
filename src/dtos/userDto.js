const { query } = require('express-validator');


module.exports = {

    index:[
        query('pagina').notEmpty().withMessage('Necessário informar a página'),
        query('quantidade').notEmpty().withMessage('Necessário informar a quantidade de registros')
    ],

    show:[
        
    ]

}