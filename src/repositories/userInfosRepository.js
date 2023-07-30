const query = require("../database/mysql-async");


class UserInfosRepository {


    findOne({ userId, id, phoneNumber }){

        return query('ECONOBOT',{
            query:'SELECT * FROM usuario_informacoes WHERE usuario_id = ? OR id = ? OR numero_telefone = ?',
            values:[userId,id,phoneNumber]
        })

    }

    insertInfos({ usuario_id, numero_telefone, endereco, bairro, numero_casa, complemento }){

        return query('ECONOBOT',{
            query:'INSERT INTO usuario_informacoes VALUES(NULL,?,?,?,?,?,?)',
            values:[usuario_id,numero_telefone,endereco,bairro,numero_casa,complemento]
        })

    }

    updateAdress(userId,adress){

        return query('ECONOBOT',{
            query:'UPDATE usuario_informacoes SET endereco = ? WHERE usuario_id = ?',
            values:[adress,userId]
        })

    }

    updateNeighBorHood(userId,neightborhood){

        return query('ECONOBOT',{
            query:'UPDATE usuario_informacoes SET bairro = ? WHERE usuario_id = ?',
            values:[neightborhood,userId]
        })

    }

    updateHouseNumber(userId,houseNumber){

        return query('ECONOBOT',{
            query:'UPDATE usuario_informacoes SET numero_casa = ? WHERE usuario_id = ?',
            values:[houseNumber,userId]
        })

    }

    updateComplement(userId,complement){

        return query('ECONOBOT',{
            query:'UPDATE usuario_informacoes SET complemento = ? WHERE usuario_id = ?',
            values:[complement,userId]
        })

    }


}

module.exports = new UserInfosRepository();