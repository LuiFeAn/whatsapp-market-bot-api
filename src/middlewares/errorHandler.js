const ApiError = require('../errors/defaultError');

module.exports = function errorHandler(error,req,res,next){

    console.log(error);
    
    if( error instanceof ApiError ){

        res.status( error.statusCode ).json({
            ...error
        });

        return ;

    }

    next();

}