// BASIC SETUP
const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
// GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// RATE LIMIT REQUEST FOR SECURITY
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request, please try again after 1 hour.'
});
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use('/api', limiter);
// ADD HEADERS FOR SECURITY
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  express.json({
    limit: '10kb'
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTIONS
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS i.e HTML/JS CODE
app.use(xss());

// MANAGE DATA POLLUTION
app.use(hpp());

app.use((req, res, next) => {
  requestedAt = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// IMPORTING ROUTERS
// eslint-disable-next-line import/no-dynamic-require
const tourRouter = require(`${__dirname}/routes/tourRouters`);
// eslint-disable-next-line import/no-dynamic-require
const userRouter = require(`${__dirname}/routes/userRouters`);

const authRouter = require(`${__dirname}/routes/authRouters`);

const reviewRouter = require(`${__dirname}/routes/reviewRouters`);
const bookingRouter = require(`${__dirname}/routes/bookingRouters`);

const viewRouter = require(`${__dirname}/routes/viewRouters`);

// WEB PAGE
app.use('/', viewRouter);
// ROUTE MOUNTING USING MIDDLEWARE CONCEPT //
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl}`);
  err.statusCode = 404;
  err.status = 'Not Found';
  next(err);
});
app.use(globalErrorController);

module.exports = app;
