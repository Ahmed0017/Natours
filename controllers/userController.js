const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const checkValidation = require('../utils/checkValidation');
const resizeWriteImage = require('../services/resizeWriteImage');
const multerSaveTo = require('../services/multerSaveTo');
const { deleteOne, updateOne, getAll, getOne } = require('./handlerFactory');

exports.uploadUserPhoto = multerSaveTo('users', 'image').single('photo');

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user trying to update password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );

  // 2) Check validation
  const data = checkValidation(req);

  // 3) Update user data
  if (req.file) {
    await resizeWriteImage(req.file, 'users', 500, 500);
    data.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    { new: true, runValidators: true }
  );
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

// Do NOT update passwords with this!
exports.updateUser = updateOne(User);

exports.getAllUsers = getAll(User);
exports.deleteUser = deleteOne(User);
exports.getUser = getOne(User);
