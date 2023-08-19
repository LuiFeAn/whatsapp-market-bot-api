const { body } = require('express-validator');


module.exports = {

    post:[
        body('contacts')
        .notEmpty()
        .withMessage('Por favor, envie os contatos')
        .isArray()
        .withMessage('Por favor, envie um array de contatos')
    ]

}

