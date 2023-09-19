const Review = require('../models/reviewModel');
const Factory = require('./handleFactory');
exports.getAllReviews = Factory.getAll(Review);

exports.setDataToHeaders = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getReviewByPara = Factory.getOne(Review, { path: 'tour' });

exports.createReviews = Factory.createOne(Review, 'Review not created!');

exports.deleteReview = Factory.deleteOne(Review);

exports.updateReview = Factory.updateOne(Review);
