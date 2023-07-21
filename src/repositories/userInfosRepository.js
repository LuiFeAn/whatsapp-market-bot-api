const query = require("../database/mysql-async");


class UserInfosRepository {


    async insertInfos({ usuario_id, numero_telefone, endereco }){

        query('ECONOBOT',{
            query:'INSERT INTO usuario_informacoes VALUES(NULL,?,?,?)',
            values:[usuario_id,numero_telefone,endereco]
        })

    }

    updateInfos(){

    }


}

module.exports = new UserInfosRepository();