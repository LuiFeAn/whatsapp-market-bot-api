const { query, body } = require('express-validator');


module.exports = {

    get:[
        query('type').notEmpty().withMessage('Necessário informar o tipo'),
        query('quanty').notEmpty().withMessage('Necessário informar a quantidade').customSanitizer( 
            value => Number(value)),
        query('page').notEmpty().withMessage('Necessário informar a página').customSanitizer( 
            value => Number(value))
    ],

    patch:[

        body('status')
        .optional()
        .isString()
        .withMessage('Por favor, enviar uma string'),

        body('reason')
        .optional()
        .isString()
        .withMessage('Por favor, enviar uma string')
        .isLength({
            max:250
        })
        .withMessage('Envie um motivo com menos de 250 caracteres')

    ]

}