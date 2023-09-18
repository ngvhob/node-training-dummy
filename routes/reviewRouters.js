const express = require('express');
const Router = express.Router();
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController')

Router.route('/').get(reviewController.getReview);
Router.route('/new').post(authController.protect, reviewController.postReview);

module.exports = Router;