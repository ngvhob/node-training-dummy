// BASIC SETUP
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

app.use('/api', limiter);
// ADD HEADERS FOR SECURITY
app.use(helmet());

app.use(
  express.json({
    limit: '10kb'
  })
);

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTIONS
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS i.e HTML/JS CODE
app.use(xss());

// MANAGE DATA POLLUTION
app.use(hpp());


app.use((req, res, next) => {
  requestedAt = new Date().toISOString();
  next();
});

// IMPORTING ROUTERS
// eslint-disable-next-line import/no-dynamic-require
const tourRouter = require(`${__dirname}/routes/tourRouters`);
// eslint-disable-next-line import/no-dynamic-require
const userRouter = require(`${__dirname}/routes/userRouters`);

const authRouter = require(`${__dirname}/routes/authRouters`);

// ROUTE MOUNTING USING MIDDLEWARE CONCEPT //
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl}`);
  err.statusCode = 404;
  err.status = 'Not Found';
  next(err);
});
app.use(globalErrorController);

module.exports = app;
