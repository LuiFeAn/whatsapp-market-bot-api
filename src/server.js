const express = require("express");
const app = require("./express");
const cors = require("cors");
const env = require("dotenv");

env.config();

const PORT_ = process.env.SERVER_PORT || 3004

app.use(cors);

app.use(express.json);

app.listen(PORT_,function(){
    console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
});