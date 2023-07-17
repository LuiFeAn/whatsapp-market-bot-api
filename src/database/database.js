const mysql = require("mysql2");

const dotenv = require("dotenv");

dotenv.config();

const econoBotConfig = {
    host:process.env.ECONOBOT_DB_HOST,
    user:process.env.ECONOBOT_DB_USER,
    password:process.env.ECONOBOT_DB_PASSWORD,
    database:process.env.ECONOBOT_DB_NAME,
    port:process.env.ECONOBOT_DB_PORT
};

const econocomprasConfig = {
    host:process.env.ECONOCOMPRAS_DB_HOST,
    user:process.env.ECONOCOMPRAS_DB_USER,
    password:process.env.ECONOCOMPRAS_DB_PASSWORD,
    database:process.env.ECONOCOMPRAS_DB_NAME,
    port:process.env.ECONOCOMPRAS_DB_PORT
}

const econoBotConnection = mysql.createPool(econoBotConfig);

const econoComprasConnection = mysql.createPool(econocomprasConfig);

function handleDbConnection(err,{ sucess, error }){
    if( err) return console.log(error);
    console.log(sucess);
}

econoBotConnection.getConnection( error => handleDbConnection( error, {
    sucess:'Conexão com o banco de dados ECONOBOT realizada com sucesso',
    error:'Não foi possível estabelecer uma conexão com o banco de dados ECONOBOT'
}));

econoComprasConnection.getConnection( error => handleDbConnection( error, {
    sucess:'Conexão com o banco de dados ECONOCOMPRAS realizada com sucesso',
    error:'Não foi possível estabelecer uma conexão com o banco de dados ECONOCOMPRAS'
}))


module.exports = {
    econoBotConnection,
    econoComprasConnection,
}