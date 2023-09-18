const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { 'tour': req.params.tourId };
    const reviews = await Review.find(filter);
    if (reviews) {
        res.status(200).json({
            msg: 'success',
            results: reviews.length,
            data: reviews
        });
    }
});

exports.createReviews = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    const { review, rating } = req.body;
    const newReview = await Review.create({
        review: review,
        rating: rating,
        tour: req.body.tour,
        user: req.body.user
    });
    if (newReview) {
        res.status(200).json({
            msg: 'success',
            data: {
                review: newReview
            }
        });
    }
});
