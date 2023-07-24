

module.exports = function delay(timing = 2000){

    return new Promise(function(resolve,reject){

        setTimeout(() => {
            resolve()
        },timing);

    })

}