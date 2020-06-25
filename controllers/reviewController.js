const Review = require('../models/reviewModel');

const { deleteOne, updateOne, createOne, getAll, getOne } = require('./handlerFactory');

exports.addToQuery = (req, res, next) => {
  //To allow for nested GET reviews on tour
  if (req.params.tourId) req.query.tour = req.params.tourId;
  next();
};

exports.setTourId = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = +req.params.tourId;
  next();
};

exports.createReview = createOne(Review, [
  { path: 'tour', select: 'name duration' },
  { path: 'user', select: 'name' }
]);
exports.getAllReviews = getAll(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
exports.getReview = getOne(Review);
