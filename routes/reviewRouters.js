const express = require('express');
const Router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

Router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, reviewController.createReviews);

module.exports = Router;
