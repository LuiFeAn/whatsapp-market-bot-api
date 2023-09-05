const { body } = require('express-validator');


module.exports = {

    post:[
        body('toUser').notEmpty().withMessage('Necessário informar o ID do usuário'),
        body('message').notEmpty().withMessage('Necessário informar a mensagem')
    ]

}

