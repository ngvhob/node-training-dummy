const express = require('express');

const tourController = require(`./../controllers/tourController`);
const Router = express.Router();

// Router.param(`id`, tourController.checkId);
Router.route('/top-5-tours').get( tourController.aliasGetTopTours, tourController.getAllTours);
Router.route('/tour-stats').get( tourController.getTourStats);
Router.route('/monthly-plan/:year').get( tourController.getMonthlyPlan);
Router.route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

Router.route('/:id')
  .get(tourController.getTourByPara)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = Router;