const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/AppError');
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
