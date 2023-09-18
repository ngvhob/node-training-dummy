const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    }
});



reviewSchema.pre(/^find/, function (next) {
    this.select('-__v');
    this.populate({
        path: 'tour',
        select: '-__v'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
