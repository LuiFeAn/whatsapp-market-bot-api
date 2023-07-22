


class BotBusyInMemoryRepository {

    isBussy

    constructor(){

        this.isBussy = [];

    }

    findOne(id){

        return this.isBussy.find( user => user.id == id );

    }

    add(id){

        this.isBussy.push({
            id,
            isBusy: false
        });

    }

    update(id,busy){

        const userBusy = this.findOne(id);

        userBusy.isBusy = busy;

    }


}

module.exports = new BotBusyInMemoryRepository()