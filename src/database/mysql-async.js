const { econoBotConnection, econoComprasConnection } = require('./database');

module.exports = function asyncQuery(db = "ECONOBOT",{
    query,
    values
}){

    return new Promise(function(resolve,reject){

        const dbs = [econoBotConnection,econoComprasConnection]

        const handleDb = { 'ECONOBOT': 0,'ECONOCOMPRAS': 1 }

        const selectedDb = handleDb[db];

        dbs[selectedDb].query(query,values,function(err,result){

            if(err) reject(err);

            resolve(result);
            
        });


    });

}