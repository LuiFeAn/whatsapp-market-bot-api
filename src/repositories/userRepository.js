const query = require('../database/mysql-async');

class UserRepository {


    async findOne({numero_telefone,id}){

        const [ result ] = await query('ECONOBOT',{
            query:'SELECT * FROM clientes WHERE numero_telefone = ? OR id = ?',
            values: [ numero_telefone, id ]
        });

        return result;

    }

    async insert({ id, nome_completo, numero_telefone,endereco, current_step }){

        query('ECONOBOT',{
            query:'INSERT INTO clientes VALUES(?,?,?,?,?)',
            values:[id,nome_completo.toUpperCase(),numero_telefone,endereco.toUpperCase(),current_step.toUpperCase()]
        });

    }

    setUsername(id,username){

        query('ECONOBOT',
        {
            query:'UPDATE clientes SET nome_completo = ? WHERE id = ?',
            values:[username,id]
        })

    }

    setPhoneNumber(id,phone){

    }

    setAdress(id,adress){

    }

    async setCurrentStep(id,step){
        query('ECONOBOT',
        {
            query:'UPDATE clientes SET current_step = ? WHERE id = ?',
            values:[step,id]
        })
    }

}


module.exports = new UserRepository();