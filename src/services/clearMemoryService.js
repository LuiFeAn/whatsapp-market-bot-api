const itemsListInMemoryRepository = require("../repositories/inMemory/itemsListInMemoryRepository");
const userLastSelectedItemInMemoryRepository = require("../repositories/inMemory/userLastSelectedItemInMemoryRepository");

class ClearMemoryService {

    clearUserLastProductAndList(usuario_id){

        const items = itemsListInMemoryRepository.getItemsList(usuario_id);

        if( items.length > 0 ){

            itemsListInMemoryRepository.removeItemsList(usuario_id);

        }

        const lastSelection = userLastSelectedItemInMemoryRepository.getSelectedItem(usuario_id);

        if( lastSelection ){

            userLastSelectedItemInMemoryRepository.removeSelectedItem(usuario_id);
            
        }

    }


}

module.exports = new ClearMemoryService();