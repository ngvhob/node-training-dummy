const AppError = require('../utils/AppError');

const handleCastErrorDb = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicacyDb = err => {
  const message = `Duplicate field value "${err.keyValue.name}", Please use another value or name.`;
  return new AppError(message, 400);
};

const handleValidatorErrorDb = err => {
  const Errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid value.${Errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err => {
  let message = err.message;
  if (err.name === 'JsonWebTokenError') {
    message = `${err.message.toUpperCase()} !` ?? `JWT Inavlid.`;
  } else {
    message = `${err.message.toUpperCase()} !` ?? `JWT Expired.`;
  }
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  console.log('ERROR 💥 ' + err);
  res.status(err.statusCode).json({
    Code: err.statusCode,
    Status: err.status,
    Message: err.message,
    Error: err,
    ErrorStack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      Status: err.status,
      Message: err.message
    });
  } else {
    res.status(500).json({
      Status: 'Error',
      Message: 'Something went wrong!'
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'Fail';
  error.isOperational = error.isOperational || false;
  switch (process.env.NODE_ENV) {
    case 'development':
      sendErrorDev(error, res);
      break;
    default:
      let err = { ...error };
      if (error.name === 'CastError') err = handleCastErrorDb(err);
      if (error.code === 11000) err = handleDuplicacyDb(err);
      if (error.name === 'ValidationError') err = handleValidatorErrorDb(err);
      if (error.name === 'TokenExpiredError' || 'JsonWebTokenError')
        err = handleJWTError(err);
      sendErrorProd(err, res);
      break;
  }
};
