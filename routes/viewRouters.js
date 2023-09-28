const express = require('express');
const Router = express.Router();
const viewController = require('../controllers/viewsController');

Router.get('/', viewController.getOverview);
Router.get('/tour/:slug', viewController.getTour);

module.exports = Router;
