

class UserDataInMemoryRepository {

    constructor(){

        this.userData = new Map()

    }

    getUserData(id){

        return this.userData.get(id);

    }

    addUserData(id,infos){

        this.userData.set(id,infos);

    }

    removeUserData(id){

        this.userData.delete(id);
        
    }

}

module.exports = new UserDataInMemoryRepository();