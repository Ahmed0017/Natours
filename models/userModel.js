const crypto = require('crypto');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addAutoIncrement = require('../utils/addAutoIncrement');
const generator = require('../services/generateCode');

const userSchema = mongoose.Schema({
  userId: String,
  method: {
    type: String,
    default: 'LOCAL',
    enum: ['GOOGLE', 'FACEBOOK', 'GITHUB', 'LOCAL']
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  countryCode: String,
  phone: String,
  photo: {
    type: String,
    default: 'default.jpg'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Role must be user, guide, lead-guide, admin'
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  password: {
    type: String,
    select: false
  },
  passwordConfirm: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  verificationCode: String,
  verificationCodeExpires: Date
});

userSchema.pre('save', async function(next) {
  // Run this middleware if password UPDATED or created NEW
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(password) {
  // Check if user try to login normally with his social email
  if (!this.password) return false;

  return await bcrypt.compare(password, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(4).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createVerificationCode = function() {
  const code = generator(6);

  this.verificationCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

  return code;
};

addAutoIncrement(userSchema, 'User');

module.exports = mongoose.model('User', userSchema);
