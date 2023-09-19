const express = require('express');
const Router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    reviewController.setDataToHeaders,
    reviewController.createReviews
  );

Router.route('/:id')
  .get(reviewController.getReviewByPara)
  .delete(authController.protect, reviewController.deleteReview)
  .patch(authController.protect, reviewController.updateReview);

module.exports = Router;
