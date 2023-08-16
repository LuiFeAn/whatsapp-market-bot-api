const { Router } = require("express");


const userInfosRoutes = Router();

const userInfosController = require("../controllers/userInfosController");

userInfosRoutes.get('/:id',userInfosController.show);

userInfosRoutes.post('/',userInfosController.create);

userInfosRoutes.patch('/:id',userInfosController.partialUpdate);

module.exports = userInfosRoutes;