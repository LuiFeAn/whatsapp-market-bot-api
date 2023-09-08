const query = require('../database/mysql-async');

class UserRepository {

    findAll({ search, quanty, page, withPromotion }){

        let restOfQuery = '';

        const params = [];

        if( search ){

            restOfQuery += 'WHERE nome_completo LIKE ? OR id LIKE ?';

            params.push(`${search}%`);
            
            params.push(`${search}%`);

        }

        if( withPromotion ){

            restOfQuery = 'JOIN aceita_promocoes ON aceita_promocoes.usuario_id = usuarios.id';

        }

        return query('ECONOBOT',{
            query:`SELECT usuarios.id as usuario_id, usuarios.nome_completo FROM usuarios ${restOfQuery} ORDER BY nome_completo ASC LIMIT ? OFFSET ?`,
            values:[...params,quanty,page]
        })

    }

    async findOne({ id }){

        const [ result ] = await query('ECONOBOT',{
            query:`SELECT * FROM usuarios WHERE id = ?`,
            values: [id]
        });

        return result;

    }

    insertUser({ whatsapp_id, nome_completo}){

        return query('ECONOBOT',{
            query:'INSERT INTO usuarios VALUES(?,?)',
            values:[whatsapp_id,nome_completo.toUpperCase()]
        });

    }

    delete(userId){

        return query('ECONOBOT',{
            query:'DELETE FROM usuarios WHERE id = ?',
            values:[userId]
        });

    }

    updateUsername(userId,fullName){

        return query('ECONOBOT',{
            query:'UPDATE usuarios SET nome_completo = ? WHERE id = ?',
            values:[fullName,userId]
        })

    }

    updateWhatsappId(userId,whatsappId){

        return query('ECONOBOT',{
            query:'UPDATE usuarios SET id = ? WHERE id = ?',
            values:[whatsappId,userId]
        })

    }


}


module.exports = new UserRepository();