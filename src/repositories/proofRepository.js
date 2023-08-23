const query = require('../database/mysql-async');

class ProofRepository {

    async insertProof({ proofPath, demandId }){

        return query('ECONOBOT',{
            query:'INSERT INTO comprovantes VALUES (NULL,?,?)',
            values:[proofPath,demandId]
        });

    }

}

module.exports = new ProofRepository();