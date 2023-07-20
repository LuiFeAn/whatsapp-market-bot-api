


class ItemsListInMemoryRepository {

    list

    constructor(){

        this.list = [];

    }

    addItemsToList({ id, items }){
        
        this.list.push({
            id,
            items
        });

    }

    getItemsList(id){

        const currentUserList = this.list.find( item => item.id === id );

        return currentUserList;

    }

    removeItemsList(id){

        this.list = this.list.filter( item => item.id != id );

    }

}

module.exports = new ItemsListInMemoryRepository;