const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  uploadTourImages,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require('../controllers/tourController');

const {
  createTourValidation,
  updateTourValidation
} = require('../validation/tourValidation');

const reviewRouter = require('./reviewRoutes');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.get('/top-5-tours', aliasTopTours, getAllTours);
router.get('/tour-stats', getTourStats);
router.get(
  '/monthly-plan/:year',
  protect,
  restrictTo('admin', 'lead-guide', 'guide'),
  getMonthlyPlan
);

router
  .route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    createTourValidation(),
    createTour
  );

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    updateTourValidation(),
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
