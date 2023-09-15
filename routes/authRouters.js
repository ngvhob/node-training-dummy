const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forget-password').post(authController.forgetPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router.route('/update-password').patch(authController.protect,authController.updatePassword);


module.exports = router;