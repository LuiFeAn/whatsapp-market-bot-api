

class UserLastMessageInMemoryRepository {

    usersLastMessages

    constructor(){

        this.usersLastMessages = [];

    }

    findLastMessage(id){

        return this.usersLastMessages.find( userLastMessage => userLastMessage.id === id );

    }

    findAllLastMessages(){

        return this.usersLastMessages;

    }

    addLastMessage(id,time){

        this.usersLastMessages.push({
            id,
            time
        });

    }

    updateLastMessage(id,time){

        const userLastMessage = this.findLastMessage(id);

        userLastMessage.time = time;

    }

    delete(id){

        this.usersLastMessages = this.usersLastMessages.filter( item => item.id != id );

    }


}

module.exports = new UserLastMessageInMemoryRepository();