const proofService = require("../services/proofService");


class ProofController {

    show(req,res){

        const { name } = req.params;

        const image = proofService.downloadProof(name);

        res.download(image);

    }

}

module.exports = new ProofController();