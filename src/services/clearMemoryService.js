const itemsListInMemoryRepository = require("../repositories/inMemory/itemsListInMemoryRepository");
const userLastSelectedItemInMemoryRepository = require("../repositories/inMemory/userLastSelectedItemInMemoryRepository");
const userDataInMemoryRepository = require("../repositories/inMemory/userDataInMemoryRepository");

class ClearMemoryService {

    clearUserLastProductAndList(usuario_id){

        itemsListInMemoryRepository.removeItemsList(usuario_id);

        userLastSelectedItemInMemoryRepository.removeSelectedItem(usuario_id);

        userDataInMemoryRepository.removeUserData(usuario_id);


    }


}

module.exports = new ClearMemoryService();