


class UserInMemoryProcessingMessageRepository {

    userProcessingList

    constructor(){

        this.userProcessingList = []

    }

    addToProcess(id){

        this.userProcessingList.push({
            id,
            processing: true
        })

    }


    getProcess(id){

        return this.userProcessingList.find( user => user.id === id );

    }

    updateProcess(id,processing){

        this.userProcessingList = this.userProcessingList.map(function(user){

            if( user.id === id ){

                return {
                    id,
                    processing
                }

            }

        })

    }

}

module.exports = new UserInMemoryProcessingMessageRepository();