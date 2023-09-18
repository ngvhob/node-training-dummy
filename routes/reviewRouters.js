const express = require('express');
const Router = express.Router();
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController')

Router.route('/').get(reviewController.getAllReviews);
Router.route('/new').post(authController.protect, reviewController.createReviews);

module.exports = Router;