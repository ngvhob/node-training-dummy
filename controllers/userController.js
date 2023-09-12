const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const user = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.getAllUsers = catchAsync( async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    requestedAt: requestedAt,
    count: users.length,
    data: {
      Users: users
    }
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.getUserByPara = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};
