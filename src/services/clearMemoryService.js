const itemsListInMemoryRepository = require("../repositories/inMemory/itemsListInMemoryRepository");
const userLastSelectedItemInMemoryRepository = require("../repositories/inMemory/userLastSelectedItemInMemoryRepository");

class ClearMemoryService {

    clearUserLastProductAndList(usuario_id){

        itemsListInMemoryRepository.removeItemsList(usuario_id);

        userLastSelectedItemInMemoryRepository.removeSelectedItem(usuario_id);

    }


}

module.exports = new ClearMemoryService();