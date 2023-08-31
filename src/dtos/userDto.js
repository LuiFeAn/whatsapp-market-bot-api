const { query, param, body } = require('express-validator');

function pageLimit(value){

    if( value <= 0 ){

        throw new Error('Por favor, informe um valor de página válido');

    }

}

module.exports = {

    get:[

        query('page').
        notEmpty().
        withMessage('Necessário informar a página').
        customSanitizer( value => Number(value)),

        query('quanty').
        notEmpty().
        withMessage('Necessário informar a quantidade de registros').
        customSanitizer( value => Number(value)),

        query('contacts').
        optional().
        isBoolean().
        withMessage('Por favor, enviar um boolean'),

        query('withPromotion').
        optional().
        isBoolean().
        withMessage('Por favor, enviar um boolean')

    ],

    post:[

        body('whatsappIds').
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