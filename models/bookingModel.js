const mongoose = require('mongoose');

const addAutoIncrement = require('../utils/addAutoIncrement');

const bookingSchema = mongoose.Schema(
  {
    tour: {
      type: Number,
      ref: 'Tour',
      required: true
    },
    user: {
      type: Number,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    paid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'tour',
      select: 'name'
    },
    'user'
  ]);
  next();
});

addAutoIncrement(bookingSchema, 'Booking');

module.exports = mongoose.model('Booking', bookingSchema);
