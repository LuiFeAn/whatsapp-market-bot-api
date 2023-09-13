const { query, body } = require('express-validator');
const isValidFields = require("../validations/isValidFields");


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
        .withMessage('Por favor, enviar uma string')
        .custom( value => isValidFields({
            requestField: value.toUpperCase(),
            validFields:['RECUSADO','APROVADO','BUSCAR NA LOJA','ENTREGAR EM CASA','FINALIZADO']
        }))
        .withMessage('Parâmetro inválido'),

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