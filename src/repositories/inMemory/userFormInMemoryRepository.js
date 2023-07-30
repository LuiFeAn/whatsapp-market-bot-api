

class UserFormRepository {

    users

    constructor(){

        this.users = new Map();

    }

    setUser(id){

       this.users.set(id)

    }

    getUser(id){

        return this.users.get(id);
        
    }

    delete(id){

        this.users.delete(id);

    }


}

module.exports = new UserFormRepository;