const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const { deleteOne, updateOne, getAll, getOne, createOne } = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Check if currently user already booked the tour
  const b = await Booking.findOne({
    tour: +req.params.tourId,
    user: req.user.id
  });

  if (b)
    return next(new AppError('Duplicate booking! You already booked this tour.', 400));

  // 2) Get the currently booked tour
  const tour = await Tour.findById(+req.params.tourId);

  // 3) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Send it to client
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.updateBooking = updateOne(Booking);
exports.getAllBookings = getAll(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.getBooking = getOne(Booking);
exports.createBooking = createOne(Booking);
