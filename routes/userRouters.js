const express = require('express');
const userController = require(`./../controllers/userController`);
const Router = express.Router();

Router.route('/').get(userController.getAllUsers).post(userController.createUser);

Router
.route('/:id')
.get(userController.getUserByPara)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = Router;

