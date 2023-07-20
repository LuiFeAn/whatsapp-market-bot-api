const query = require("../database/mysql-async");

class BotOptionsRepository {

    async enableProductDescription(){

        query("ECONOBOT",{
            query:"UPDATE econobot SET enviar_descricao_produto = ?",
            values:[1]
        })

    }

    async disableProductDescription(){

        query("ECONOBOT",{
            query:"UPDATE econobot SET enviar_descricao_produto = ?",
            values:[0]
        })

    }

}

module.exports = new BotOptionsRepository();