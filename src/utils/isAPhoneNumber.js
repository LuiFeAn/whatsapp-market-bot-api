module.exports = function validPhoneNumber(numero) {

    const cleanNumber = numero.replace(/\D/g, '');

    const regex = /^(?:\+?55)?(?:0?[1-9]{2})?(?:9[2-9][0-9]{7}|[2-9][0-9]{7})$/;
  
    return regex.test(cleanNumber);

}
