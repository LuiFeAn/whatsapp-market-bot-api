


class UserStateInMemory {

    userStates 

    constructor(){

        this.userStates = new Map();

    }

    getState(id){

        return this.userStates.get(id);

    }


    setState(id,state){

        this.userStates.set(id,{
            current_state: state,
        });

    }


    removeState(id){

        this.userStates.delete(id);

    }



}

module.exports = new UserStateInMemory();