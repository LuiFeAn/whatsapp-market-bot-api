


class BotBusyInMemoryRepository {

    isBussy

    constructor(){

        this.isBussy = new Map();

    }

    findBussy(id){

        return this.isBussy.get(id);

    }

    setBussy(id){

       this.isBussy.set(id,true);

    }

    removeBussy(id){

        this.isBussy.delete(id);

    }



}

module.exports = new BotBusyInMemoryRepository()