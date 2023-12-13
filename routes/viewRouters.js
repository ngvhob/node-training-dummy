const express = require('express');
const Router = express.Router();
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

Router.get('/me', authController.protect, viewController.getMe);
Router.post(
  '/upadateUserData',

  authController.protect,
  viewController.upadateUserData
);
Router.use(authController.isLoggedIn);
Router.get(
  '/',
  bookingController.createBookingCheckout,
  viewController.getOverview
);
Router.get('/tour/:slug', viewController.getTour);
Router.get('/mytour', viewController.getMyTour);
Router.get('/login', viewController.getLogin);

module.exports = Router;
