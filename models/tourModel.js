const mongoose = require('mongoose');
const slugify = require('slugify');

const addAutoIncrement = require('../utils/addAutoIncrement');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      required: true
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'difficult']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: true
    },
    images: [String],
    startDates: {
      type: [Date],
      required: true
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    guides: [
      {
        type: Number,
        ref: 'User'
      }
    ],
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

tourSchema.index({ ratingsAverage: 1, price: 1 });
tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save(), .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

tourSchema.pre(/^find/, function(next) {
  if (this._fields && !Object.keys(this._fields).includes('__v') && !this._fields.guides)
    return next();

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

addAutoIncrement(tourSchema, 'Tour');

module.exports = mongoose.model('Tour', tourSchema);
