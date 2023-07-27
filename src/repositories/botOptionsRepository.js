const query = require("../database/mysql-async");

class BotOptionsRepository {

    enableProductDescription(){

        return query("ECONOBOT",{
            query:"UPDATE econobot SET enviar_descricao_produto = ?",
            values:[1]
        })

    }

    async disableProductDescription(){

        return query("ECONOBOT",{
            query:"UPDATE econobot SET enviar_descricao_produto = ?",
            values:[0]
        })

    }

}

module.exports = new BotOptionsRepository();