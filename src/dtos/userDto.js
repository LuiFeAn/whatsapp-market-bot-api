const { query, param, body } = require('express-validator');

const jsonParse = require('../utils/jsonParse'); 

module.exports = {

    get:[

        query('getAll').
        notEmpty().
        isBoolean().
        withMessage('Por favor, envie um boolean').
        customSanitizer( value => jsonParse(value)),

        query('page').
        optional().
        customSanitizer( value => Number(value)),

        query('quanty').
        optional().
        customSanitizer( value => Number(value)),

        query('contacts').
        optional().
        isBoolean().
        withMessage('Por favor, enviar um boolean').
        customSanitizer( value => jsonParse(value)),

        query('withPromotion').
        optional().
        isBoolean().
        withMessage('Por favor, enviar um boolean').
        customSanitizer( value => jsonParse(value)),

    ],

    post:[

        body('whatsappId').
        notEmpty().
        withMessage('Por favor, envie o número de whatsapp'),

        body('fullName').
        notEmpty().
        withMessage('Por favor, envie o nome completo')

    ],

    getWithParam:[

        param('id').
        notEmpty().
        withMessage('Por favor, envie o ID do usuário')

    ],

    update:[

        param('id').
        notEmpty().
        withMessage('Por favor, envie o ID do usuário'),

        body('fullName').
        notEmpty().
        withMessage('Por favor, envie o nome completo')

    ],

    delete:[

        param('id').
        notEmpty().
        withMessage('Por favor, envie o ID do usuário')

    ],

}