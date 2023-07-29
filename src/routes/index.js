const { Router } = require("express");

const routes = Router();

const demandRoute = require("./demandRoute");

routes.use('/pedidos',demandRoute);

module.exports = routes;