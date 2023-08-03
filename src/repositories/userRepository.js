const query = require('../database/mysql-async');

class UserRepository {


    async findOne({numero_telefone,id}){

        const [ result ] = await query('ECONOBOT',{
            query:`SELECT * FROM usuarios`,
            values: [ numero_telefone, id ]
        });

        return result;

    }

    insertUser({ id, nome_completo}){

        return query('ECONOBOT',{
            query:'INSERT INTO usuarios VALUES(?,?)',
            values:[id,nome_completo]
        });

    }

    setCurrentStep(id,step){
        
        return query('ECONOBOT',
        {
            query:'UPDATE usuarios SET current_step = ? WHERE id = ?',
            values:[step,id]
        })
    }

}


module.exports = new UserRepository();