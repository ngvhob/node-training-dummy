const express = require('express');
const userController = require(`./../controllers/userController`);
const authController = require('../controllers/authController');
const Router = express.Router();

Router.route('/').get(authController.protect, userController.getAllUsers).post(authController.protect, userController.createUser);

Router
.route('/:id')
.get(userController.getUserByPara)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = Router;

