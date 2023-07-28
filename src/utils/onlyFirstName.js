

module.exports = function onlyFirstName(username){


    const word = username.trim().split(' ');
    
    const firstName = word[0];
    
    const firstNameCapitalize = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    
    return firstNameCapitalize;
      
      

}