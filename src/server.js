require("express-async-errors")
const express = require("express");
const corsConfig = require("./cors/config");
const cors = require("cors");
const env = require("dotenv");
const routes = require('./routes');
const errorHandler = require("./middlewares/errorHandler");
const serverApplicationHandler = require('./middlewares/serverApplicationHandler');
const path = require('path');
env.config();

const app = express();

const PORT_ = process.env.SERVER_PORT || 3004

const server = app.listen(PORT_,function(){
    console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
});

app.use('/api',cors(corsConfig));

app.use('/api',express.json());

app.use('/api',routes);

app.use(express.static(path.join(__dirname,'../public')))

app.use('*',serverApplicationHandler)

app.use('/api',errorHandler);

module.exports = {
    app,
    server
}
