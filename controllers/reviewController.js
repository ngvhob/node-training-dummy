const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();
    if (reviews) {
        res.status(200).json({
            msg: 'success',
            results: reviews.length,
            data: reviews
        });
    }
});

exports.createReviews = catchAsync(async (req, res, next) => {
    const { review, rating, tour } = req.body;
    const user = req.user._id;
    const newReview = await Review.create({
        review: review,
        rating: rating,
        tour: tour,
        user: user
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
