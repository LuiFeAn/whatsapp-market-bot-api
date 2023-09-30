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

const messageRoutes = require('./messageRoutes');

const botRoutes = require('../routes/botRoutes');

routes.use('/demands',demandRoute);

routes.use('/users',userRoutes);

routes.use('/users/infos',userInfosRoutes);

routes.use('/booklets',bookletRoutes);

routes.use('/send-booklets',sendBookletRoutes);

routes.use('/cart-items',cartItemsRoutes);

routes.use('/proofs',proofRoutes);

routes.use('/messages',messageRoutes);

routes.use('/bot',botRoutes);

routes.use('/images/booklets',express.static(path.join(__dirname,'../images/booklets')));

module.exports = routes;