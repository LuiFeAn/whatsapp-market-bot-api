const { Router } = require("express");

const routes = Router();

const demandRoute = require("./demandRoute");

const userRoutes = require("./userRoutes");

const userInfosRoutes = require("./userInfosRoutes");

const bookletRoutes = require("./bookletRoutes");

routes.use('/pedidos',demandRoute);

routes.use('/usuarios',userRoutes);

routes.use('/usuarios/informacoes',userInfosRoutes);

routes.use('/encartes',bookletRoutes);

module.exports = routes;