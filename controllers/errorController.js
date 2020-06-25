const AppError = require('../utils/appError');

const handleInvalidJsonData = () => new AppError('Your JSON data is invalid!', 400);

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = err.message.map(el => el.msg);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! PLease log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR----->', err);
    return res.status(err.statusCode).json({
      status: err.status,
      errors: err.message,
      message: err.msg || err.message
      // stack: err.stack
    });
  }

  // RENDERED WEBSITE
  console.error('ERROR----->', err.message);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A1) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // A2) Programming or other unknown error: don't leack error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // B) SO, RENDERED WEBSITE
  // B1)
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B2)
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'PLease try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    if (Array.isArray(err.message)) {
      // That means it is from express-validator
      const errors = err.message.map(el => el.msg);
      const message = `Invalid input data. ${errors.join('. ')}`;
      err.msg = message;
    }
    sendErrorDev(err, req, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.expose) error = handleInvalidJsonData(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (Array.isArray(error.message)) {
      // That means it is from express-validator
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
