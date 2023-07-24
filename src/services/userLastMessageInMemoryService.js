
const userLastMessageInMemoryRepository = require("../repositories/inMemory/userLastMessageInMemoryRepository");

class UserLastMessageInMemoryService {

    setLastMessage(user_id){

        const date = new Date();

        const lastMessage = userLastMessageInMemoryRepository.findLastMessage(user_id);

        if( !lastMessage ){

            userLastMessageInMemoryRepository.addLastMessage(user_id,date);

        }

        userLastMessageInMemoryRepository.updateLastMessage(user_id,date);

    }

}

module.exports = new UserLastMessageInMemoryService();