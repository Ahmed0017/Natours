const express = require('express');

const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

const {
  getOverview,
  getTour,
  getSignupForm,
  getPhoneSignupForm,
  verify,
  forgotPassword,
  resetPassword,
  getLoginForm,
  getAccount,
  getMyTours
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.use(isLoggedIn);

router.get('/', createBookingCheckout, getOverview);

router.get('/tour/:slug', getTour);

router.get('/signup', getSignupForm);
router.get('/phoneSignup', getPhoneSignupForm);
router.get('/verify', verify);
router.get('/forgotPassword', forgotPassword);
router.get('/resetPassword/:token', resetPassword);

router.get('/login', getLoginForm);

module.exports = router;
