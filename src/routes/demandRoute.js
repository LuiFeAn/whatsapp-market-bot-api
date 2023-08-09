const { Router } = require("express");

const demandRoutes = Router();

const demandController = require("../controllers/demandController");

const demandDto = require('../dtos/demandDto');

const expressValidator = require('../middlewares/expressValidator');

demandRoutes.get('/',demandDto.get,expressValidator,demandController.index);

demandRoutes.patch('/',demandController.partialUpdate);

module.exports = demandRoutes 