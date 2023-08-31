// BASIC SETUP
const express = require('express');
const app = express();
const morgan = require('morgan');
// MIDDLEWARES
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
  console.log('IN DEV MODE');
  app.use(morgan('dev'));
}
app.use(express.json());
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });
app.use((req, res, next) => {
  //req.requestedAt = new Date().toISOString();
  requestedAt = new Date().toISOString();
  next();
});
// app.use(express.static(`${__dirname}/public`));
// IMPORTING ROUTERS
// eslint-disable-next-line import/no-dynamic-require
const tourRouter = require(`${__dirname}/routes/tourRouters`);
// eslint-disable-next-line import/no-dynamic-require
const userRouter = require(`${__dirname}/routes/userRouters`);

// ROUTE MOUNTING USING MIDDLEWARE CONCEPT //
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);


app.all('*', (req, res, next)=>{
  res.status(404).json({
    Code: 404,
    Status: 'failed',
    Message: `Can't find ${req.originalUrl}`
  });
  next();
})
module.exports = app;
