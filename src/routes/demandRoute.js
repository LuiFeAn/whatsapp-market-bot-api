const { Router } = require("express");

const demandRoutes = Router();

const demandController = require("../controllers/demandController");

demandRoutes.get('/',demandController.index);

demandRoutes.patch('/',demandController.partialUpdate);

module.exports = demandRoutes 