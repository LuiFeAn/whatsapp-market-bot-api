const query = require('../database/mysql-async');

class UserRepository {


    async findOne({numero_telefone,id}){

        const [ result ] = await query('ECONOBOT',{
            query:`

                SELECT 
                usuarios.id,nome_completo,current_step,
                usuario_informacoes.endereco,usuario_informacoes.numero_telefone,
                niveis_acesso.nivel_acesso 
                FROM usuarios
                LEFT JOIN usuario_informacoes
                ON usuario_informacoes.usuario_id = usuarios.id
                JOIN niveis_acesso
                ON niveis_acesso.id = usuarios.nivel_acesso_id
                WHERE 
                usuario_informacoes.numero_telefone = ? 
                OR 
                usuarios.id = ?


            `,
            values: [ numero_telefone, id ]
        });

        return result;

    }

    insertUser({ id, nome_completo, current_step, nivel_acesso_id }){

        return query('ECONOBOT',{
            query:'INSERT INTO usuarios VALUES(?,?,?,?)',
            values:[id,nome_completo.toUpperCase(),current_step,nivel_acesso_id]
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