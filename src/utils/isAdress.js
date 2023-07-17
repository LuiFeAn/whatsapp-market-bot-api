module.exports = function validAdress(string) {

    if (string.trim()) {

      return false;

    }
  
    const regexAdress = /^[a-zA-Z0-9\s\.,-]+$/;

    if (!regexAdress.test(string)) {

      return false;

    }

    return true;
    
  }