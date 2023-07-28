

module.exports = function delay(timing = 1000){

    return new Promise(function(resolve,reject){

        setTimeout(() => {
            resolve()
        },timing);

    })

}