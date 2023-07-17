

class UserInMemmoryRepository {

    users

    constructor(){

        this.users = []

    }

    insert(id){

        this.users.push({
            id
        });

    }

    findOne(id){

        const user = this.users.find( user => user.id === id );

        return user;
        
    }

    findAll(){

        return this.users;

    }

    delete(numero_telefone){

        this.users.filter( user => user.numero_telefone === numero_telefone );

    }

    update({id,nome_completo,numero_telefone,endereco}){

        this.users = this.users.map(function(user){

            if( user.id === id ){

                return {
                    id,
                    nome_completo: nome_completo ?? user.nome_completo,
                    numero_telefone: numero_telefone ?? user.numero_telefone,
                    endereco: endereco ?? user.endereco
                }

            }

        })

    }

}

module.exports = new UserInMemmoryRepository();