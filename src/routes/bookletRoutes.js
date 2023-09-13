const { Router } = require("express");

const Multer = require("../middlewares/multer");

const bookletRoutes = Router();

const bookletController = require("../controllers/bookletController");

bookletRoutes.get('/',bookletController.index);

bookletRoutes.post('/',Multer('booklets').single('encarte'),bookletController.create);

bookletRoutes.delete('/',bookletController.delete);

module.exports = bookletRoutes;