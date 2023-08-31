const express = require('express');

const { Router } = require("express");

const path = require('path');

const routes = Router();

const demandRoute = require("./demandRoute");

const userRoutes = require("./userRoutes");

const userInfosRoutes = require("./userInfosRoutes");

const bookletRoutes = require("./bookletRoutes");

const sendBookletRoutes = require('../routes/sendBookletRoutes');

const cartItemsRoutes = require('../routes/cartItemsRoutes');

const proofRoutes = require('./proofRoutes');

routes.use('/demands',demandRoute);

routes.use('/users',userRoutes);

routes.use('/users/infos',userInfosRoutes);

routes.use('/booklets',bookletRoutes);

routes.use('/send-booklets',sendBookletRoutes);

routes.use('/cart-items',cartItemsRoutes);

routes.use('/proofs',proofRoutes);

module.exports = routes;