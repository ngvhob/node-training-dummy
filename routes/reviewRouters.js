const express = require('express');
const Router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
Router.use(authController.protect);

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.setDataToHeaders, reviewController.createReviews);

Router.route('/:id')
  .get(reviewController.getReviewByPara)
  .delete(
    authController.restrict('admin', 'user'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrict('admin', 'user'),
    reviewController.updateReview
  );

module.exports = Router;
