const { Router } = require("express");

const demandRoutes = Router();

const demandController = require("../controllers/demandController");

const demandDto = require('../dtos/demandDto');

const expressValidator = require('../middlewares/expressValidator');

demandRoutes.get('/',demandDto.get,expressValidator,demandController.index);

demandRoutes.get('/:id',demandController.show);

demandRoutes.patch('/:id',demandDto.patch,expressValidator,demandController.partialUpdate);

module.exports = demandRoutes 