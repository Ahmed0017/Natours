const { check } = require('express-validator');

const User = require('../models/userModel');

exports.signupValidation = () => [
  check('name')
    .notEmpty()
    .withMessage(() => 'Please tell us your name')
    .isString()
    .withMessage(() => 'Please provide just an string'),

  check('email')
    .notEmpty()
    .withMessage(() => 'Please tell us your email')
    .isEmail()
    .withMessage(() => 'Please provide a valid email')
    .custom(async val => {
      const user = await User.findOne({
        email: val,
        active: true
      });
      if (user) throw new Error('Duplicate email pLease use another one');
    }),

  check('password')
    .notEmpty()
    .withMessage(() => 'Please provide a password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .isLength({ min: 8 })
    .withMessage(() => 'The password must have more or equal then 10 characters'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage(() => 'Please confirm your password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords are not the same.');
      return true;
    })
];

exports.verifyValidation = () => [
  check('code')
    .notEmpty()
    .withMessage(() => 'Please provide your verification code')
    .isInt()
    .withMessage(() => 'A code must be a number')
];

exports.passwordRestTokenValidation = () => [
  check('code')
    .notEmpty()
    .withMessage(() => 'Please provide your verification code')
    .isString()
    .withMessage(() => 'A code must be an string')
];

exports.signupPhoneValidation = () => [
  check('name')
    .notEmpty()
    .withMessage(() => 'Please tell us your name')
    .isString()
    .withMessage(() => 'Please provide just an string'),

  check('countryCode')
    .notEmpty()
    .withMessage(() => 'Please tell us provide your country code')
    .isString()
    .withMessage(() => 'Please provide just an string'),

  check('phone')
    .notEmpty()
    .withMessage(() => 'Please tell us your phone')
    .isString()
    .withMessage(() => 'Please provide your phone as an string')
    .custom(async val => {
      const regEx = /^\d{3}-\d{3}-\d{4}$/;
      if (!`${val}`.match(regEx))
        throw new Error(`Invalid phone! Please use the format 123-455-6784`);
      const user = await User.findOne({
        phone: val,
        active: true
      });
      if (user) throw new Error('Duplicate phone number pLease use another one');
    }),

  check('password')
    .notEmpty()
    .withMessage(() => 'Please provide a password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .isLength({ min: 8 })
    .withMessage(() => 'The password must have more or equal then 10 characters'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage(() => 'Please confirm your password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords are not the same.');
      return true;
    })
];

exports.verifyTwilioValidation = () => [
  check('phone')
    .notEmpty()
    .withMessage(() => 'Please tell us your [phone]')
    .isString()
    .withMessage(() => 'Please provide your phone as an string')
    .custom(async val => {
      const regEx = /^\d{3}-\d{3}-\d{4}$/;
      if (!`${val}`.match(regEx))
        throw new Error(`Invalid phone! Please use the format 123-455-6784`);
    }),

  check('code')
    .notEmpty()
    .withMessage(() => 'Please provide your verification code')
    .isInt()
    .withMessage(() => 'A code must be a number')
];

exports.loginValidation = () => [
  check('email')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your email')
    .isEmail()
    .withMessage(() => 'Please provide a valid email'),

  check('phone')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your phone number')
    .isString()
    .withMessage(() => 'Please provide your phone as an string')
    .custom(async val => {
      const regEx = /^\d{3}-\d{3}-\d{4}$/;
      if (!`${val}`.match(regEx))
        throw new Error(`Invalid phone! Please use the format 123-455-6784`);
    }),

  check('password')
    .notEmpty()
    .withMessage(() => 'Please provide a password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .isLength({ min: 8 })
    .withMessage(() => 'The password must have more or equal then 10 characters')
];

exports.resendCodeForgotPassValidation = () => [
  check('email')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your email')
    .isEmail()
    .withMessage(() => 'Please provide a valid email'),

  check('phone')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your phone number')
    .isString()
    .withMessage(() => 'Please provide your phone as an string')
    .custom(async val => {
      const regEx = /^\d{3}-\d{3}-\d{4}$/;
      if (!`${val}`.match(regEx))
        throw new Error(`Invalid phone! Please use the format 123-455-6784`);
    })
];

exports.passwordValidation = () => [
  check('password')
    .notEmpty()
    .withMessage(() => 'Please provide a password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .isLength({ min: 8 })
    .withMessage(() => 'The password must have more or equal then 10 characters'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage(() => 'Please confirm your password')
    .isString()
    .withMessage(() => 'Please provide just an string')
    .custom(async (val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords are not the same.');
    })
];

exports.updateMeValidation = () => [
  check('name')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your name')
    .isString()
    .withMessage(() => 'Please provide just an string'),

  check('email')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your email')
    .isEmail()
    .withMessage(() => 'Please provide a valid email')
    .custom(async (val, { req }) => {
      const user = await User.findOne({
        email: val,
        active: true
      });

      if (user) throw new Error('Duplicate email pLease use another one');
      if (req.user.phone)
        throw new Error(`You already have a phone! So you can't use an email.`);
    }),

  check('phone')
    .optional()
    .notEmpty()
    .withMessage(() => 'Please tell us your phone number')
    .isString()
    .withMessage(() => 'Please provide your phone as an string')
    .custom(async val => {
      const regEx = /^\d{3}-\d{3}-\d{4}$/;
      if (!`${val}`.match(regEx))
        throw new Error(`Invalid phone! Please use the format 123-455-6784`);
    })
    .custom(async (val, { req }) => {
      const user = await User.findOne({
        phone: val,
        active: true
      });
      if (user) throw new Error('Duplicate phone pLease use another one');
      if (req.user.email)
        throw new Error(`You already have an email! So you can't use a phone.`);
    })
];
