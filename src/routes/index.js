
const { Router } = require("express");

const routes = Router();

const demandRoute = require("./demandRoute");

routes.use('/routes',demandRoute);