const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const passport = require('passport');

const signToken = require('../utils/signToken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');
const AppError = require('../utils/appError');
const resizeWriteImage = require('../services/resizeWriteImage');
const Email = require('../services/email');
const { twilioSendCustom, twilioSend, twilioVerify } = require('../services/twilio');

const createCookieOptions = expiresDate => {
  const cookieOptions = {
    expires: expiresDate,
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  return cookieOptions;
};

const createSendToken = (res, user, statusCode) => {
  const token = signToken(user.id);

  const cookieOptions = createCookieOptions(
    new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
  );

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const createSendTokenOAuth = (res, user) => {
  const token = signToken(user.id);

  const cookieOptions = createCookieOptions(
    new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
  );
  res.cookie('jwt', token, cookieOptions);

  res.redirect('/');
};

exports.signup = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  // Write file
  if (req.file) {
    await resizeWriteImage(req.file, 'users', 500, 500);
    data.photo = req.file.filename;
  }

  const newUser = await User.create(data);

  const code = newUser.createVerificationCode();
  await newUser.save({ validateBeforeSave: false });

  try {
    // Send verification code via email
    await new Email(newUser, '', code).sendVerificationCode();
  } catch (err) {
    newUser.verificationCode = undefined;
    newUser.verificationCodeExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the verification code. PLease try again later.',
        500
      )
    );
  }

  const cookieOptions = createCookieOptions(new Date(Date.now() + 10 * 60 * 1000));

  res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Code sent successfully'
  });
});

exports.verify = method =>
  catchAsync(async (req, res, next) => {
    // Check validation
    const data = checkValidation(req);

    const { code } = data;

    // Get user based on the code
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    let user;

    if (method === 'normal') {
      user = await User.findOne({
        verificationCode: hashedCode,
        verificationCodeExpires: { $gt: Date.now() }
      });

      if (!user) return next(new AppError('Code is invalid or has expired', 400));

      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      const url = `${req.protocol}://${req.get('host')}/me`;
      await new Email(user, url).sendWelcome();

      const cookieOptions = createCookieOptions(new Date(Date.now() + 1000));
      res.cookie('verify', 'done', cookieOptions);

      return createSendToken(res, user, 201);
    }

    if (method === 'resetPassword') {
      user = await User.findOne({
        passwordResetToken: hashedCode,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) return next(new AppError('Code is invalid or has expired', 400));

      user.isVerified = true;
      await user.save({ validateBeforeSave: false });

      const cookieOptionsVerify = createCookieOptions(new Date(Date.now() + 1000));
      res.cookie('verify', 'done', cookieOptionsVerify);

      return res.status(200).json({
        status: 'success',
        message: 'code verified successfully!'
      });
    }
  });

exports.signupPhone = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  const { countryCode, phone } = data;

  const fullPhone = `+${countryCode}${phone.split('-').join('')}`;

  // Write file
  if (req.file) {
    await resizeWriteImage(req.file, 'users', 500, 500);
    data.photo = req.file.filename;
  }

  await User.create(data);

  try {
    // Send verification code via SMS
    await twilioSend(fullPhone);
  } catch (err) {
    return next(
      new AppError(
        'There was an error sending the verification code. Please try again later.',
        500
      )
    );
  }

  const cookieOptions = createCookieOptions(new Date(Date.now() + 2 * 60 * 1000));

  res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Code sent successfully'
  });
});

exports.verifyTwilio = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  const { phone, code } = data;

  const user = await User.findOne({ phone });

  if (!user) return next(new AppError('No user found with that phone', 404));

  const fullPhone = `+${user.countryCode}${phone.split('-').join('')}`;

  const { valid } = await twilioVerify(fullPhone, code);

  if (valid) {
    user.isVerified = true;
    await user.save();

    const cookieOptions = createCookieOptions(new Date(Date.now() + 1000));
    res.cookie('verify', 'done', cookieOptions);

    return createSendToken(res, user, 201);
  }

  if (!valid) return next(new AppError('Invalid code', 400));

  return next(new AppError('Expired code', 400));
});

exports.resendCode = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  const { email, phone } = data;

  if (!email && !phone) {
    return next(new AppError('Please provide your email or phone!', 400));
  }

  if (email) {
    // Get user based on email
    const user = await User.findOne({ email, active: true });

    if (!user) return next(new AppError('There is no user with that email!', 404));

    // send code
    const code = user.createVerificationCode();
    await user.save({ validateBeforeSave: false });

    try {
      await new Email(user, '', code).sendVerificationCode();
    } catch (err) {
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    const cookieOptions = createCookieOptions(new Date(Date.now() + 10 * 60 * 1000));

    res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Code sent successfully'
    });
  }

  if (phone) {
    // Get user based on phone
    const user = await User.findOne({ phone, active: true });

    if (!user) return next(new AppError('There is no user with that phone!', 404));

    // Send code
    const fullPhone = `+${user.countryCode}${phone.split('-').join('')}`;

    await twilioSend(fullPhone);

    const cookieOptions = createCookieOptions(new Date(Date.now() + 2 * 60 * 1000));

    res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Code sent successfully'
    });
  }
});

exports.passportAuthenticate = method =>
  passport.authenticate(method, {
    session: false,
    failureRedirect: '/login'
  });

exports.signupOAuth = method =>
  catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const name = req.user.displayName;
    const email = req.user.emails[0].value;

    const user = await User.findOne({ userId: id });

    if (!user) {
      const newUser = await User.create({
        method,
        userId: id,
        name,
        email
      });

      const url = `${req.protocol}://${req.get('host')}/me`;
      await new Email(newUser, url).sendWelcome();

      return createSendTokenOAuth(res, newUser);
    }

    createSendTokenOAuth(res, user);
  });

exports.login = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  const { email, phone, password } = data;

  if (!email && !phone) {
    return next(new AppError('Please provide your email or phone!', 400));
  }

  let user;

  if (email) {
    user = await User.findOne({
      email,
      method: 'LOCAL',
      active: true
    }).select('+password');

    if (!user || !(await user.correctPassword(password)))
      return next(new AppError('Incorrect email or password', 401));

    if (!user.isVerified) {
      return next(
        new AppError(
          'Your account is not yet verified! You can order a new code down below.',
          400
        )
      );
    }

    createSendToken(res, user, 200);
  }

  if (phone) {
    user = await User.findOne({
      phone,
      method: 'LOCAL',
      active: true
    }).select('+password');

    if (!user || !(await user.correctPassword(password)))
      return next(new AppError('Incorrect phone or password', 401));

    if (!user.isVerified) {
      return next(
        new AppError(
          'Your account is not yet verified! You can order a new code down below.',
          400
        )
      );
    }

    createSendToken(res, user, 200);
  }
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'Loggedout', {
    expires: new Date(Date.now() + 10 * 1000)
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token, check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError('You are not logged in! Please log in to get access.', 401));

  // 2) Verfication token
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findOne({ _id: payload.id, active: true });

  if (!currentUser)
    return next(
      new AppError('The user belonging to this token does no longer exist!', 401)
    );

  // 4) Check if userser change password after token was issued
  if (currentUser.changedPasswordAfter(payload.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verfication token
      const payload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(payload.id);

      if (!currentUser) return next();

      // 3) Check if user change password after token was issued
      if (currentUser.changedPasswordAfter(payload.iat)) return next();

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check validation
  const data = checkValidation(req);

  const { phone, email } = data;

  if (!email && !phone) {
    return next(new AppError('Please provide your email or phone!', 400));
  }

  if (email) {
    // Get user based on email
    const user = await User.findOne({ email, active: true });

    if (!user) return next(new AppError('There is no user with that email!', 404));

    // send token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
      await new Email(user, resetURL, resetToken).sendPasswordReset();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. PLease try again later!', 500)
      );
    }

    const cookieOptionsVerify = createCookieOptions(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptionsVerify);

    const cookieOptionsReset = createCookieOptions(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    res.cookie('reset', process.env.RESET_TOKEN, cookieOptionsReset);

    res.status(200).json({
      status: 'success',
      message: 'Code sent successfully'
    });
  }

  if (phone) {
    // Get user based on phone
    const user = await User.findOne({ phone, active: true });

    if (!user) return next(new AppError('There is no user with that phone!', 404));

    // Send code
    const fullPhone = `+${user.countryCode}${phone.split('-').join('')}`;

    // send token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
      const body = `Your Natours reset code: ${resetToken}. Valid for 10 minutes`;
      await twilioSendCustom(body, process.env.TWILIO_PHONE_NUMBER, fullPhone);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          'There was an error sending the message. PLease try again later!',
          500
        )
      );
    }

    const cookieOptions = createCookieOptions(new Date(Date.now() + 2 * 60 * 1000));

    res.cookie('verify', process.env.VERIFY_TOKEN, cookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Code sent successfully'
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Check validation
  const { password, passwordConfirm } = checkValidation(req);

  // 2) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 3) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Update the passwordChangedAt property for the user

  // 5) Log user in, Send JWT
  const cookieOptions = createCookieOptions(new Date(Date.now() + 1000));
  res.cookie('reset', 'done', cookieOptions);
  res.cookie('verify', 'done', cookieOptions);
  createSendToken(res, user, 200);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Check validation
  const { password, passwordConfirm } = checkValidation(req);

  // 2) Get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 3) Check if current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent)))
    return next(new AppError('You current password is in correct.', 401));

  // 4) If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 5) Log user in, send JWT
  createSendToken(res, user, 200);
});
