

class BotDefaultErrors extends Error{

    errors
    type

    constructor({errors,type}){
        super()
        this.errors = errors,
        this.type = type
    }


}

module.exports = BotDefaultErrors;