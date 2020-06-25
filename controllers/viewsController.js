const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('No tour found with that name!', 404));

  // 2) Build template

  //3) Render the template
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup With Email'
  });
};

exports.getPhoneSignupForm = (req, res) => {
  // res.cookie('verify', 'uifekqhfntenhwj');

  res.status(200).render('phoneSignup', {
    title: 'Signup With Phone'
  });
};

exports.verify = (req, res) => {
  if (!req.cookies.verify || req.cookies.verify !== process.env.VERIFY_TOKEN)
    res.redirect('/');

  res.status(200).render('verify', {
    title: 'Verify',
    normal: true
  });
};

exports.forgotPassword = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgotten password'
  });
};

exports.resetPassword = (req, res) => {
  if (!req.cookies.reset || req.cookies.reset !== process.env.RESET_TOKEN)
    res.redirect('/');

  res.status(200).render('resetPassword', {
    title: 'Reset password',
    token: req.params.token
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  // Find all bookings for current user
  const tourIds = await Booking.find({ user: req.user.id }).distinct('tour');

  // Find tours with returnes IDs
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
