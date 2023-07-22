

class UserFormRepository {

    users

    constructor(){

        this.users = []

    }

    insert(userForm){

       this.users.push(userForm);

    }

    findOne(id){

        const user = this.users.find( user => user.id === id );

        return user;
        
    }

    delete(id){

        this.users.filter( user => user.id === id );

    }


}

module.exports = new UserFormRepository;