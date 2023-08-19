
module.exports = function isValidFields({ validFields, requestField }){

    if( !validFields.includes( requestField) ){

        throw new Error();

    }

}