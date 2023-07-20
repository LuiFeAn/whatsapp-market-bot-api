const app = require("./express");
const env = require("dotenv");

env.config();

const PORT_ = process.env.SERVER_PORT || 3004

app.listen(PORT_,function(){
    console.log(`O servidor HTTP foi iniciado na prota ${PORT_} e está pronto para receber requisições`);
});