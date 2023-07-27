const query = require("../database/mysql-async");


class UserInfosRepository {


    insertInfos({ usuario_id, numero_telefone, endereco }){

        return query('ECONOBOT',{
            query:'INSERT INTO usuario_informacoes VALUES(NULL,?,?,?)',
            values:[usuario_id,numero_telefone,endereco]
        })

    }

    updateInfos(){

    }


}

module.exports = new UserInfosRepository();