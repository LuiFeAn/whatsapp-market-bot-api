const typeorm = require("typeorm")
const env = require("dotenv");

env.config();

const econoBotDataSource = new typeorm.DataSource({
    type: "mysql",
    host: process.env.ECONOBOT_DB_HOST,
    port: process.env.ECONOBOT_DB_PORT,
    username: process.env.ECONOBOT_DB_USER,
    password: process.env.ECONOBOT_DB_PASSWORD,
    database: process.env.ECONOBOT_DB_NAME,
});

( async () => {

    try{

        console.log('Conectado com sucesso ao banco Econobot !');

        await econoBotDataSource.initialize();

    }catch(err){

        console.log('Não foi possível estabelecer uma conexão com o banco')

    }

})();

module.exports = econoBotDataSource;