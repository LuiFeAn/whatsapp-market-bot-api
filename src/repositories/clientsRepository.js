

class ClientRepository {

    constructor(){

        this.clients = new Map();

    }

    allClients(){

        return this.clients

    }

    getClient(key){

        return this.clients.get(key);

    }

    setClient(id,data){

        this.clients.set(id,data);

    }

    deleteClient(id){

        this.clients.delete(id);

    }


}

module.exports = new ClientRepository();