const { Router } = require("express");

const botOptions = Router();

const demandController = require("../controllers/demandController");

botOptions.patch('/',demandController.partialUpdate);