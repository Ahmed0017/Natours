const { validationResult, matchedData } = require('express-validator');

const AppError = require('../utils/appError');

module.exports = req => {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    throw new AppError(errors, 400);
  }

  return matchedData(req);
};
