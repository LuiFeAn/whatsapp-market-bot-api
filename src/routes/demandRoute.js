const { Router } = require("express");

const demandRoutes = Router();

const demandController = require("../controllers/demandController");

demandRoutes.patch('/',demandController.partialUpdate);

module.exports = demandRoutes 