const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = async id => {
  return await jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
  ),
  secure: false,
  httpOnly: true
};
if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const createSendToken = async (user, statusCode, res) => {
  let token = await signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    roles: req.body.roles
  });
  if (newUser) {
    await createSendToken(newUser, 201, res);
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
  await createSendToken(user, 201, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 + 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(new AppError('You must be logged in to view this data.', 401));
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    next(new AppError('The user belonging to this token does not exit.', 401));
  }
  let expiredCheck = await currentUser.changePasswordAfter(decode.iat);
  if (expiredCheck) {
    next(new AppError('Password changed please verify login again.', 401));
  }
  req.user = currentUser;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      next(new AppError('You are not authorized to perform this action.', 401));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide a valid email.', 400));
  }
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError('No user found for the provided email.', 404));
  }

  const resetToken = await user.createPasswordResetToken();
  const status = await user.save({ validateBeforeSave: false });
  if (status && resetToken) {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${resetToken}`;
    const message = `You're just one click away from resetting your password!\nClick ${resetURL} to create a new one.\n Ignore if you haven't made this reset password request.`;
    try {
      await sendEmail({
        to: user.email,
        subject: `This password reset mail is valid for 10m.`,
        text: message
      });
      res.status(201).json({
        status: 'success',
        msg: 'Password reset mail sent!'
      });
    } catch (error) {
      console.log();
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      const status = await user.save({ validateBeforeSave: false });
      return new AppError(error, 500);
    }
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (user) {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await createSendToken(user, 201, res);
  } else {
    return next(
      new AppError('Inavlid token or token has already expired.', 400)
    );
  }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).select('+password');
  if (
    !(await currentUser.correctPassword(
      req.body.password,
      currentUser.password
    ))
  ) {
    return next(
      new AppError(
        'Incorrect current password please check your password again.',
        401
      )
    );
  }

  try {
    currentUser.password = req.body.newPassword;
    currentUser.passwordConfirm = req.body.passwordConfirm;
    await currentUser.save();
    await createSendToken(currentUser, 201, res);
  } catch (error) {
    next(new AppError(error, 500));
  }
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return next();
      }
      let expiredCheck = await currentUser.changePasswordAfter(decode.iat);
      if (expiredCheck) {
        return next();
      }
      // ASSIGN LOGGED IN USER TO LOCALS RES.
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  return next();
};
