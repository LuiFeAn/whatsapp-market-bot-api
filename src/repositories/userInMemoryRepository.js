

class UserInMemmoryRepository {

    users

    constructor(){

        this.users = []

    }

    insert(user){

       this.users.push(user);

    }

    findOne(id){

        const user = this.users.find( user => user.id === id );

        return user;
        
    }

    delete(id){

        this.users.filter( user => user.id === id );

    }


}

module.exports = new UserInMemmoryRepository();