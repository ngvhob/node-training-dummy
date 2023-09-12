const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = async id => {
  return await jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt : req.body.passwordChangedAt
  });
  let token = await signToken(newUser._id);
  if (newUser) {
    res.status(201).json({
      status: 'success',
      token: token,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid  email or password', 401));
  }
  let token = await signToken(user._id);
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(new AppError('You must be logged in to view this data.', 401));
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decode.id);
  if(!currentUser){
    next(new AppError('The user belonging to this token does not exit.', 401));
  }
  let expiredCheck = await currentUser.changePasswordAfter(decode.iat);
  if(expiredCheck){
    next(new AppError('Password changed please verify login again.', 401));
  }
  req.user = currentUser;
  next();
});
