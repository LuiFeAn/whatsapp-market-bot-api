

class ClientRepository {

    constructor(){

        this.clients = new Map();

    }

    allClients(){

        return this.clients

    }

    setClient(id,data){

        this.clients.set(id,data);

    }

    deleteClient(id){

        this.clients.delete(id);

    }


}

module.exports = new ClientRepository();