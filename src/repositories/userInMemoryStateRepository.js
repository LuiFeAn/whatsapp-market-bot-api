

class userInMemoryStateRepository {

    steps 

    constructor(){

        this.steps = [];

    }

    findOne(id){

        const stepUser = this.steps.find( step => step.id === id );

        return stepUser;

    }

    insert({ step, id }){

        this.steps.push({
            step,
            id
        })

    }

    update({ id, step }){

        this.steps = this.steps.map(function(userStep){

            if( userStep.id === id ){

                return {
                    ...userStep,
                    step
                }

            }

        })

    }

}

module.exports = new userInMemoryStateRepository();