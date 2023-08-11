const express = require("express");
const corsConfig = require("./cors/config");
const cors = require("cors");
const env = require("dotenv");
const routes = require('./routes');
const errorHandler = require("./middlewares/errorHandler");

env.config();

const app = express();

const PORT_ = process.env.SERVER_PORT || 3004

const server = app.listen(PORT_,function(){
    console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
});

app.use(cors(corsConfig));

app.use(express.json());

app.use(routes);

app.use(errorHandler);

module.exports = {
    app,
    server
}
