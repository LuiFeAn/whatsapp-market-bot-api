const path = require('path');

class ProofService {

    downloadProof(name){
        
        const imagePath = path.join(__dirname,`../images/proofs/${name}`);

        return imagePath;

    }

}

module.exports = new ProofService();