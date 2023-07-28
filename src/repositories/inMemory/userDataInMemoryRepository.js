

class UserDataInMemoryRepository {

    constructor(){

        this.userData = new Map()

    }

    getUserData(id){

        return this.userData.get(id);

    }

    setUserData(id,data){

        this.userData.set(id,data);

    }

    removeUserData(id){

        this.userData.delete(id);
        
    }


}

module.exports = new UserDataInMemoryRepository();