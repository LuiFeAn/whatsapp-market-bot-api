const { Router } = require("express");

const userRoutes = Router();

const userController = require("../controllers/userController");

userRoutes.get('/',userController.index);

userRoutes.get('/:id',userController.show);

userRoutes.put('/:id',userController.update);

userRoutes.post('/:id',userController.store);

userRoutes.delete('/:id',userController.delete);