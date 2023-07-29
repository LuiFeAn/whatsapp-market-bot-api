

module.exports = function delay(timing = 200){

    return new Promise(function(resolve,reject){

        setTimeout(() => {
            resolve()
        },timing);

    })

}