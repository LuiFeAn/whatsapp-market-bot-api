

module.exports = function delay(timing = 3000){

    return new Promise(function(resolve,reject){

        setTimeout(() => {
            resolve()
        },timing);

    })

}