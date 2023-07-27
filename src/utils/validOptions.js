

module.exports = function validOptions(options,value){

    if(!options.includes(value)){
        return
    }

    return true;

}