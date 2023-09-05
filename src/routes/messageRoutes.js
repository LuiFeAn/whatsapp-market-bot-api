
const { Router } = require('express');

const messageRoutes = Router();

const messageDto = require('../dtos/messageDto');

const messageController = require('../controllers/messageController');

messageRoutes.post('/',messageDto.post,messageController.create);

module.exports = messageRoutes;