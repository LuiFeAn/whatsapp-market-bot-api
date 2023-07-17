


class UserMessageCounter {

    counter

    constructor(){

        this.counter = []

    }

    start({ id, time }){

        this.counter.push({
            id,
            time
        })

    }

    find(id){

        this.counter = this.counter.find( count => count.id === id );

    }
    
    set({ id, time }){

        this.counter = this.counter.map(function(counter){

            if( counter.id === id ){

                return {
                    id,
                    time
                }

            }

        })

    }

}

module.exports = new UserMessageCounter();