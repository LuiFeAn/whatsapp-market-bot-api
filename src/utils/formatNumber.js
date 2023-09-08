

module.exports = function formatNumber(number){

    number = number.replace(/\D/g, '');

    return `55${number}@c.us`

}