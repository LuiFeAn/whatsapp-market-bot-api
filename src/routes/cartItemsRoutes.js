const { Router } = require('express');

const cartItemsRoutes = Router();

const cartItemsController = require('../controllers/cartItemsController');

cartItemsRoutes.get('/:id',cartItemsController.show);

module.exports = cartItemsRoutes;