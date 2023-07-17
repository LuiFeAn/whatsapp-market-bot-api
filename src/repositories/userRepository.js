const query = require('../infra/mysql-async');

class UserRepository {


    async findOne({numero_telefone,id}){

        const [ result ] = await query('ECONOBOT',{
            query:'SELECT * FROM clientes WHERE numero_telefone = ? OR id = ?',
            values: [ numero_telefone, id ]
        });

        return result;

    }

    async insert({ id, nome_completo, numero_telefone,endereco }){

        query('ECONOBOT',{
            query:'INSERT INTO clientes VALUES(?,?,?,?)',
            values:[id,nome_completo,numero_telefone,endereco]
        });

    }

}


module.exports = new UserRepository();