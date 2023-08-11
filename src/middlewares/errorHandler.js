const ApiError = require('../errors/defaultError');

module.exports = function errorHandler(error,req,res,next){

    if( error instanceof ApiError ){

        res.status( error.statusCode || 500 ).json({
            ...error
        });

        return ;

    }

    next();

}