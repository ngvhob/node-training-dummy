const express = require('express');
const userController = require(`./../controllers/userController`);
const authController = require('../controllers/authController');
const Router = express.Router();

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

Router.use(authController.protect);

Router.route('/me')
  .patch(userController.updateMe)
  .get(userController.setUserId, userController.getMe);

Router.route('/delete-profile').post(userController.deleteMe);
Router.use(authController.restrict('admin'));
Router.route('/:id')
  .get(userController.getUserByPara)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
