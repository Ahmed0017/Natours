const express = require('express');

const {
  signupValidation,
  verifyValidation,
  signupPhoneValidation,
  verifyTwilioValidation,
  resendCodeForgotPassValidation,
  passwordRestTokenValidation,
  loginValidation,
  passwordValidation,
  updateMeValidation
} = require('../validation/userValidation');

const {
  getAllUsers,
  getUser,
  createUser,
  uploadUserPhoto,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
} = require('../controllers/userController');

const {
  signup,
  signupPhone,
  verify,
  resendCode,
  verifyTwilio,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', uploadUserPhoto, signupValidation(), signup);
router.post('/verify', verifyValidation(), verify('normal'));
router.post('/signupPhone', uploadUserPhoto, signupPhoneValidation(), signupPhone);
router.post('/verifyTwilio', verifyTwilioValidation(), verifyTwilio);
router.post('/login', loginValidation(), login);
router.post('/resendCode', resendCodeForgotPassValidation(), resendCode);
router.get('/logout', logout);

router.post(
  '/verifyPasswordResetToken',
  passwordRestTokenValidation(),
  verify('resetPassword')
);
router.post('/forgotPassword', resendCodeForgotPassValidation(), forgotPassword);
router.patch('/resetPassword/:token', passwordValidation(), resetPassword);

router.use(protect);

router.patch('/updateMyPassword', passwordValidation(), updateMyPassword);

router.patch('/updateMe', uploadUserPhoto, updateMeValidation(), updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me', getMe, getUser);

router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
