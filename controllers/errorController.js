module.exports = (error, req, res, next)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'Fail';
    // console.error(error)
    res.status(error.statusCode).json({
      Code:  error.statusCode,
      Status:  error.status,
      Message: error.message
    })
  }