const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();
    if (reviews) {
        res.status(200).json({
            msg: 'success',
            data: reviews
        });
    }
});

exports.postReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);
    if (newReview) {
        res.status(200).json({
            msg: 'success',
            data: {
                review: newReview
            }
        });
    }
});
