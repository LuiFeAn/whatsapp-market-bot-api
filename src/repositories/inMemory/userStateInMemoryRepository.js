


class UserStateInMemory {

    userStates 

    constructor(){

        this.userStates = []

    }

    addState(id){

        this.userStates.push({
            id,
            current_state:'CHOOSE_MENU_OPTION',
            state_historic:["CHOOSE_MENU_OPTION"]
        });

    }

    findState(id){

        const userState = this.userStates.find( userState => userState.id == id);

        return userState;

    }

    removeState(id){

        const remove = this.userStates.filter( userState => userState.id != id);

        this.userStates = remove;

    }

    updateState(id,current_state){

        const userState = this.findState(id);

        userState.current_state = current_state;

        userState.state_historic.push(current_state);

    }

    updateStateHistoric(id,newState){

        const userState = this.findState(id);

        userState.state_historic = newState;

    }

    removeLast(id,newHistoric){

        this.userStates = this.userStates.map(function(userState){

            if(userState.id === id ){

                return{
                    ...userState,
                    state_historic: newHistoric
                }

            }

        })

    }

}

module.exports = new UserStateInMemory();