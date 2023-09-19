const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const user = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

const filterObj = (obj, ...values) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (values.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = Factory.getAll(User);

exports.createUser = Factory.createOne(User, 'User not created!');

exports.getUserByPara = Factory.getOne(User);

exports.updateUser = Factory.updateOne(User);

exports.deleteUser = Factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("You can't update password from this route"), 400);
  }

  const filterBody = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('Inavlid user!, Please login again.', 400));
  }
  res.status(201).json({
    status: 'Success',
    message: 'Profile Updated!',
    data: user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  if (!user) {
    return next(new AppError('Inavlid user ! Please login again.', 400));
  }
  res.status(201).json({
    status: 'Success',
    message: 'Profile deleted!',
    data: null
  });
});

exports.setUserId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
}

exports.getMe = Factory.getOne(User);