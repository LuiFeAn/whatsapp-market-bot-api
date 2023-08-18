const { query } = require('express-validator');


module.exports = {

    index:[
        query('page').notEmpty().withMessage('Necessário informar a página'),
        query('quanty').notEmpty().withMessage('Necessário informar a quantidade de registros')
    ],

    show:[
        
    ]

}