const path = require('path');

module.exports = function serverApplicationHandler(req,res,next){
    
    if( !req.originalUrl.startsWith('/api') ){

        res.sendFile(path.join(__dirname,'../../public','index.html'));

        return
    }

    next();

}