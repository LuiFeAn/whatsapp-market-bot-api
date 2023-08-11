

class ApiError extends Error{

    errors
    type

    constructor({statusCode,errors,type}){
        super()
        this.errors = errors,
        this.type = type
        this.statusCode = statusCode;
    }


}

module.exports = ApiError;