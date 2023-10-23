const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const Factory = require('./handleFactory');

const filterObj = (obj, ...values) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (values.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file! Only images allowed.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadImage = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

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
  if (req.file) filterBody.photo = req.file.filename;
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
};

exports.getMe = Factory.getOne(User);
