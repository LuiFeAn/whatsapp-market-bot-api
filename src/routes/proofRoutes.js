
const { Router } = require('express');

const proofRoutes = Router();

const proofController = require('../controllers/proofController');

proofRoutes.get('/:name',proofController.show);

module.exports = proofRoutes;
