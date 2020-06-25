const mongoose = require('mongoose');

const addAutoIncrement = require('../utils/addAutoIncrement');
const Tour = require('./tourModel');
const AppError = require('../utils/appError');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: true
    },
    rating: Number,
    tour: {
      type: Number,
      ref: 'Tour',
      required: true
    },
    user: {
      type: Number,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

reviewSchema.statics.calcRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, function(doc) {
  if (doc) doc.constructor.calcRatings(doc.tour);
});

reviewSchema.pre('save', async function(next) {
  // Check if tour exist before do a review
  if (!(await Tour.findById(this.tour)))
    return next(new AppError('No tour found with that ID! ', 400));
  next();
});

reviewSchema.pre(/^find/, async function(next) {
  if (this._fields && !Object.keys(this._fields).includes('__v') && !this._fields.guides)
    return next();

  this.populate([
    {
      path: 'user',
      select: 'name photo'
    }
  ]);
  next();
});

addAutoIncrement(reviewSchema, 'Review');

module.exports = mongoose.model('Review', reviewSchema);
