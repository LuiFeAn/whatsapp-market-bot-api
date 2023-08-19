const { Router } = require("express");

const userRoutes = Router();

const userController = require("../controllers/userController");

const userDto = require('../dtos/userDto');

const expressValidator = require('../middlewares/expressValidator');

userRoutes.get('/',userDto.get,expressValidator,userController.index);

userRoutes.get('/:id',userDto.getWithParam,expressValidator,userController.show);

userRoutes.put('/:id',userDto.update,expressValidator,userController.update);

userRoutes.post('/:id',userDto.post,expressValidator,userController.store);

userRoutes.delete('/:id',userDto.delete,expressValidator,userController.delete);

module.exports = userRoutes;