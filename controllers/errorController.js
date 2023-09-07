const AppError = require("../utils/AppError");

const handleCastErrorDb = err =>{
  const message  = `Invalid ${err.path} : ${err.value}`
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
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
    // console.error(err);
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
      let err = {...error};
      const errName = error.name;
      if(errName === 'CastError')  err = handleCastErrorDb(err);
      sendErrorProd(err, res);
      break;
  }
};
