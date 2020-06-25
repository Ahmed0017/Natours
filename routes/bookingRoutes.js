const express = require('express');

const {
  getCheckoutSession,
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');

const {
  createBookingValidation,
  updateBookingValidation
} = require('../validation/bookingValidation');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .post(createBookingValidation(), createBooking)
  .get(getAllBookings);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBookingValidation(), updateBooking)
  .delete(deleteBooking);

module.exports = router;
