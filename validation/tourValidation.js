const { check } = require('express-validator');

const Tour = require('../models/tourModel');

exports.createTourValidation = () => [
  check('name')
    .notEmpty()
    .withMessage(() => 'A tour must have a name')
    .isString()
    .withMessage(() => 'A tour name must be an string')
    .isLength({ min: 10, max: 40 })
    .withMessage(() => 'A tour name must be about 10 to 40 characters')
    .custom(async val => {
      const tour = await Tour.findOne({
        name: val
      });
      if (tour) throw new Error('Duplicate tour name pLease use another one');
    }),

  check('duration')
    .notEmpty()
    .withMessage(() => 'A tour must have a duration')
    .isNumeric()
    .withMessage(() => 'A tour duration must be a number'),

  check('maxGroupSize')
    .notEmpty()
    .withMessage(() => 'A tour must have a max group size')
    .isNumeric()
    .withMessage(() => 'A tour max group size must be a number'),

  check('difficulty')
    .notEmpty()
    .withMessage(() => 'A tour must have a difficulty')
    .isString()
    .withMessage(() => 'A tour difficulty must be an string')
    .isIn(['easy', 'medium', 'difficult'])
    .withMessage(() => 'Difficulty is either: easy, medium, difficult'),

  check('ratingsAverage')
    .optional()
    .notEmpty()
    .withMessage(() => 'A ratings average must have a value')
    .isFloat({ min: 1, max: 5 })
    .withMessage(() => 'A ratings average must be a number between 1.0 and 5.0'),

  check('price')
    .notEmpty()
    .withMessage(() => 'A tour must have a price')
    .isNumeric()
    .withMessage(() => 'A tour price must be a number'),

  check('priceDiscount')
    .optional()
    .isNumeric()
    .withMessage(() => 'A discount price must be a number')
    .custom((val, { req }) => {
      if (val > req.body.price)
        throw new Error(`Discount price ${val} should be below regular price`);
      return true;
    }),

  check('summary')
    .notEmpty()
    .withMessage(() => 'A tour must have a summary')
    .isString()
    .withMessage(() => 'A tour summary must be an string'),

  check('description')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour description must have a value')
    .isString()
    .withMessage(() => 'A tour description must be an string'),

  // check('imageCover')
  //   .notEmpty()
  //   .withMessage(() => 'A tour must have a cover image'),

  check('startDates')
    .notEmpty()
    .withMessage(() => 'A tour must have at least one start date'),

  check('startDates.*').custom(val => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!`${val}`.match(regEx))
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    const d = new Date(val);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0)
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    if (d.toISOString().slice(0, 10) !== val)
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    return true;
  }),

  check('secretTour')
    .optional()
    .notEmpty()
    .withMessage(() => 'A secret tour must have a value')
    .isBoolean()
    .withMessage(() => 'A secret tour must be true or false'),

  check('startLocation.type')
    .optional()
    .notEmpty()
    .withMessage(() => 'An start location type must have a value')
    .isIn(['Point'])
    .withMessage(() => 'An start location type must be a Point'),

  check('startLocation.coordinates')
    .notEmpty()
    .withMessage(() => 'An start location must have a coordinates')
    .isArray()
    .withMessage('A coordinates must be an array')
    .custom(val => {
      if (!val || val.length !== 2) throw new Error('Please add a valid coordinates');
      return true;
    }),

  check('startLocation.coordinates.*')
    .isNumeric()
    .withMessage(() => 'An start location coordinates must be an array of numbers')
    .isLength({ min: 9 })
    .withMessage(() => 'Please add a valid coordinates'),

  check('startLocation.address')
    .notEmpty()
    .withMessage(() => 'An start location must have an address')
    .isString()
    .withMessage(() => 'An start location address must be an string'),

  check('startLocation.description')
    .notEmpty()
    .withMessage(() => 'An start location must have a description')
    .isString()
    .withMessage(() => 'An start location description must be an string'),

  check('locations.*.type')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location type must have a value')
    .isIn(['Point'])
    .withMessage(() => 'A location type must be a Point'),

  check('locations.coordinates')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have a coordinates')
    .isArray()
    .withMessage('A coordinates must be an array')
    .custom(val => {
      if (!val || val.length !== 2) throw new Error('Please add a valid coordinates');
      return true;
    }),

  check('locations.coordinates.*')
    .optional()
    .isNumeric()
    .withMessage(() => 'A location coordinates must be an array of numbers')
    .isLength({ min: 9 })
    .withMessage(() => 'Please add a valid coordinates'),

  check('locations.*.address')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have an address')
    .isString()
    .withMessage(() => 'A location address must be an string'),

  check('locations.*.description')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have a description')
    .isString()
    .withMessage(() => 'A location description must be an string'),

  check('locations.*.day')
    .optional()
    .notEmpty()
    .withMessage(() => 'A day must have a value')
    .isNumeric()
    .withMessage(() => 'A day must be an string')
];

exports.updateTourValidation = () => [
  check('name')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a name')
    .isString()
    .withMessage(() => 'A tour name must be an string')
    .isLength({ min: 10, max: 40 })
    .withMessage(() => 'A tour name must be about 10 to 40 characters')
    .custom(async val => {
      const tour = await Tour.findOne({
        name: val
      });
      if (tour) throw new Error('Duplicate tour name pLease use another one');
    }),

  check('duration')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a duration')
    .isNumeric()
    .withMessage(() => 'A tour duration must be a number'),

  check('maxGroupSize')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a max group size')
    .isNumeric()
    .withMessage(() => 'A tour max group size must be a number'),

  check('difficulty')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a difficulty')
    .isString()
    .withMessage(() => 'A tour difficulty must be an string')
    .isIn(['easy', 'medium', 'difficult'])
    .withMessage(() => 'Difficulty is either: easy, medium, difficult'),

  check('ratingsAverage')
    .optional()
    .notEmpty()
    .withMessage(() => 'A ratings average must have a value')
    .isFloat({ min: 1, max: 5 })
    .withMessage(() => 'A ratings average must be a number between 1.0 and 5.0'),

  check('price')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a price')
    .isNumeric()
    .withMessage(() => 'A tour price must be a number'),

  check('priceDiscount')
    .optional()
    .isNumeric()
    .withMessage(() => 'A discount price must be a number')
    .custom((val, { req }) => {
      if (val > req.body.price)
        throw new Error(`Discount price ${val} should be below regular price`);
      return true;
    }),

  check('summary')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have a summary')
    .isString()
    .withMessage(() => 'A tour summary must be an string'),

  check('description')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour description must have a value')
    .isString()
    .withMessage(() => 'A tour description must be an string'),

  check('startDates')
    .optional()
    .notEmpty()
    .withMessage(() => 'A tour must have at least one start date'),

  check('startDates.*').custom(val => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!`${val}`.match(regEx))
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    const d = new Date(val);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0)
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    if (d.toISOString().slice(0, 10) !== val)
      throw new Error(`Invalid date! Please use the format yyyy/mm/dd`);
    return true;
  }),

  check('secretTour')
    .optional()
    .notEmpty()
    .withMessage(() => 'A secret tour must have a value')
    .isBoolean()
    .withMessage(() => 'A secret tour must be true or false'),

  check('startLocation.type')
    .optional()
    .notEmpty()
    .withMessage(() => 'An start location type must have a value')
    .isIn(['Point'])
    .withMessage(() => 'An start location type must be a Point'),

  check('startLocation.coordinates')
    .optional()
    .notEmpty()
    .withMessage(() => 'An start location must have a coordinates')
    .isArray()
    .withMessage('A coordinates must be an array')
    .custom(val => {
      if (val.length !== 2) throw new Error('Please add a valid coordinates');
      return true;
    }),

  check('startLocation.coordinates.*')
    .optional()
    .isNumeric()
    .withMessage(() => 'An start location coordinates must be an array of numbers')
    .isLength({ min: 9 })
    .withMessage(() => 'Please add a valid coordinates'),

  check('startLocation.address')
    .optional()
    .notEmpty()
    .withMessage(() => 'An start location must have an address')
    .isString()
    .withMessage(() => 'An start location address must be an string'),

  check('startLocation.description')
    .optional()
    .notEmpty()
    .withMessage(() => 'An start location must have a description')
    .isString()
    .withMessage(() => 'An start location description must be an string'),

  check('locations.*.type')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location type must have a value')
    .isIn(['Point'])
    .withMessage(() => 'A location type must be a Point'),

  check('locations.coordinates')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have a coordinates')
    .isArray()
    .withMessage('A coordinates must be an array')
    .custom(val => {
      if (!val || val.length !== 2) throw new Error('Please add a valid coordinates');
      return true;
    }),

  check('locations.coordinates.*')
    .optional()
    .isNumeric()
    .withMessage(() => 'A location coordinates must be an array of numbers')
    .isLength({ min: 9 })
    .withMessage(() => 'Please add a valid coordinates'),

  check('locations.*.address')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have an address')
    .isString()
    .withMessage(() => 'A location address must be an string'),

  check('locations.*.description')
    .optional()
    .notEmpty()
    .withMessage(() => 'A location must have a description')
    .isString()
    .withMessage(() => 'A location description must be an string'),

  check('locations.*.day')
    .optional()
    .notEmpty()
    .withMessage(() => 'A day must have a value')
    .isNumeric()
    .withMessage(() => 'A day must be an string')
];
