const { check } = require('express-validator');

const Review = require('../models/reviewModel');

exports.createReviewValidation = () => [
  check('review')
    .notEmpty()
    .withMessage(() => 'Review can not be empty')
    .isString()
    .withMessage(() => 'A Review must be an string'),

  check('rating')
    .optional()
    .notEmpty()
    .withMessage(() => 'Rating can not be empty')
    .isFloat({ min: 1, max: 5 })
    .withMessage(() => 'A rating name must be a number between 0 and 6'),

  check('tour')
    .notEmpty()
    .withMessage(() => 'Review must belong to a tour')
    .isNumeric()
    .withMessage(() => 'A tour must be an ID of number')
    .custom(async (val, { req }) => {
      const r = await Review.findOne({
        tour: val,
        user: req.user.id
      });
      if (r) throw new Error('Duplicate review! You can not add more than one.');
    })
];

exports.updateReviewValidation = () => [
  check('review')
    .optional()
    .notEmpty()
    .withMessage(() => 'Review can not be empty')
    .isString()
    .withMessage(() => 'A Review must be an string'),

  check('rating')
    .optional()
    .notEmpty()
    .withMessage(() => 'Rating can not be empty')
    .isFloat({ min: 1, max: 5 })
    .withMessage(() => 'A rating name must be a number between 0 and 6')
];
