const { Router } = require('express');

const botRoutes = Router();

const botController = require('../controllers/botController');

botRoutes.get('/',botController.index);

module.exports = botRoutes;