const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  const Tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'Exciting tours for adventurous people',
    tours: Tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const TourData = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  if (!TourData) {
    return next(new AppError(`The request tour was not found.`, 404));
  }
  res
    .status(200)
    .render('tour', { title: `${TourData.name} Tour`, tourData: TourData });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: `Login` });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My Profile'
  });
});

exports.upadateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'My Profile',
    user: updatedUser
  });
});

exports.getMyTour = catchAsync(async (req, res, next) => {
  const user_id = res.locals.user._id ? res.locals.user._id : req.body._id;
  if (!user_id) {
    return next(new AppError(403, 'Not Authenticated.'));
  }
  const BookingData = await Booking.find({
    user : user_id
  });

  const tourIds = BookingData.map((el) => el.tour);
  const tours = await Tour.find({_id : {$in : tourIds}});
  if (!BookingData || !tours) {
    return next(new AppError(`The request tour was not found.`, 404));
  }
  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours
  });
});
