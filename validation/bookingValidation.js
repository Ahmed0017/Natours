const { check } = require('express-validator');

exports.createBookingValidation = () => [
  check('tour')
    .notEmpty()
    .withMessage(() => 'Booking must belong to a tour')
    .isNumeric()
    .withMessage(() => 'A tour must be an ID of number'),

  check('price')
    .notEmpty()
    .withMessage(() => 'Booking must have a price')
    .isNumeric()
    .withMessage(() => 'A price must be a number'),

  check('paid')
    .optional()
    .notEmpty()
    .withMessage(() => 'A paid can not be empty')
    .isBoolean()
    .withMessage(() => 'A paid must be true or false')
];

exports.updateBookingValidation = () => [
  check('tour')
    .optional()
    .notEmpty()
    .withMessage(() => 'Booking must belong to a tour')
    .isNumeric()
    .withMessage(() => 'A tour must be an ID of number'),

  check('price')
    .optional()
    .notEmpty()
    .withMessage(() => 'Booking must have a price')
    .isNumeric()
    .withMessage(() => 'A price must be a number'),

  check('paid')
    .optional()
    .notEmpty()
    .withMessage(() => 'A paid can not be empty')
    .isBoolean()
    .withMessage(() => 'A paid must be true or false')
];
