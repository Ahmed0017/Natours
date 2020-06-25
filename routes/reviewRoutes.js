const express = require('express');

const {
  createReview,
  getAllReviews,
  getReview,
  setTourId,
  updateReview,
  deleteReview,
  addToQuery
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');
const {
  createReviewValidation,
  updateReviewValidation
} = require('../validation/reviewValidation');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(restrictTo('user'), setTourId, createReviewValidation(), createReview)
  .get(addToQuery, getAllReviews);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReviewValidation(), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
