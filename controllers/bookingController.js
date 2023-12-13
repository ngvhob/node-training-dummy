const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/AppError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (tour) {
    console.log(`https://www.natours.dev/img/tours/${tour.imageCover}.jpg`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user._id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://www.natours.dev/img/tours/${tour.imageCover}.jpg`
              ]
            }
          },
          quantity: 1
        }
      ],
      mode: 'payment'
    });

    res.status(200).json({
      status: 'success',
      session: session
    });
  } else {
    res.status(404).json({
      status: false,
      data: `Tour not found.`
    });
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) {
    return next();
  }
  const book = await Booking.create({
    tour,
    user,
    price
  });
  console.log(book);
  res.redirect(`${req.protocol}://${req.get('host')}/`);
});
