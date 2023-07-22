class UserLastSelectedItemInMemoryRepository {

    userSelectedItems

    constructor(){

        this.userSelectedItems = [];

    }


    getSelectedItem(id){

        return this.userSelectedItems.find( item => item.id === id );

    }


    addSelectedItem({ id, selected_item }){

        this.userSelectedItems.push({
            id,
            selected_item
        });

    }

    removeSelectedItem(id){

        this.userSelectedItems = this.userSelectedItems.filter( item => item.id != id );

    }


}

module.exports = new UserLastSelectedItemInMemoryRepository();