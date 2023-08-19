const { Router } = require('express');

const sendBookletRoutes = Router();

const sendBookletDto = require('../dtos/sendBookletDto');

const sendBookletController = require('../controllers/sendBookletController');

sendBookletRoutes.post('/',sendBookletDto.post,sendBookletController.send);

module.exports = sendBookletRoutes;