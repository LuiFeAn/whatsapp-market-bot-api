

module.exports = function delay(timing = 500){

    return new Promise(function(resolve,reject){

        setTimeout(() => {
            resolve()
        },timing);

    })

}