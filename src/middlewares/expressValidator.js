const { validationResult } = require('express-validator');

module.exports = function expressValidator(req,res,next){
    
    const errors = validationResult(req).array();

    if( errors.length > 0 ){

        res.status(500).json(errors)

        return

    }

    next();

}