const express = require('express');

const tourController = require(`./../controllers/tourController`);
const authController = require(`./../controllers/authController`);
const Router = express.Router();
const reviewRouter = require('./reviewRouters');

Router.use('/:tourId/reviews', reviewRouter);

Router.route('/top-5-tours').get(
  tourController.aliasGetTopTours,
  tourController.getAllTours
);
Router.route('/tour-stats').get(tourController.getTourStats);

Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.createTour
  );

Router.route('/tours-within/distance/:distance/center/:lonlat/unit/:unit').get(
  tourController.getToursWithin
);

Router.route('/distances/:lonlat/unit/:unit').get(tourController.getDistances);

Router.use(authController.protect);

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/:id')
  .get(tourController.getTourByPara)
  .patch(
    authController.restrict('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
