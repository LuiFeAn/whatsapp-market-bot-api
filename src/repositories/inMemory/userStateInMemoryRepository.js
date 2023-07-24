


class UserStateInMemory {

    userStates 

    constructor(){

        this.userStates = []

    }

    addStateToUser(id){

        this.userStates.push({
            id: user,
            currentState:'CHOOSE_MENU_OPTION',
            lastState:''
        });

    }

    findState(id){

        const userState = this.userStates.find( userState => userState == id);

    }

    removeState(id){

        const remove = this.userStates.filter( userState => userState.id != id);

        this.userStates = remove;

    }

    updateState(id,current_state,last_state){

        const userState = this.findState(id);

        userState.current_state = current_state;

        userState.lastLastate = last_state;

    }

}

module.exports = new UserStateInMemory();