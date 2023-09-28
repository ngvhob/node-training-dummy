const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
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
  if (!Tour) {
    res.status(404).json({
      status: 'Not Found'
    });
  }
  res
    .status(200)
    .render('tour', { title: `${TourData.name} Tour`, tourData: TourData });
});
