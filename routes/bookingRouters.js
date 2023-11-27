const express = require('express');
const Router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

Router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = Router;
