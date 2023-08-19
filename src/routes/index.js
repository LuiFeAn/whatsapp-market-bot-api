const { Router } = require("express");

const routes = Router();

const demandRoute = require("./demandRoute");

const userRoutes = require("./userRoutes");

const userInfosRoutes = require("./userInfosRoutes");

const bookletRoutes = require("./bookletRoutes");

const sendBookletRoutes = require('../routes/sendBookletRoutes');

routes.use('/demands',demandRoute);

routes.use('/users',userRoutes);

routes.use('/users/infos',userInfosRoutes);

routes.use('/booklets',bookletRoutes);

routes.use('/send-booklets',sendBookletRoutes);

module.exports = routes;