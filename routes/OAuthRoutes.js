const express = require('express');
const passport = require('passport');

const { passportAuthenticate, signupOAuth } = require('../controllers/authController');

const router = express.Router();

// Auth with google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Callback route for google to redirect to
router.get('/google/redirect', passportAuthenticate('google'), signupOAuth('GOOGLE'));

// Auth with Facebbok
router.get('/facebook', passport.authenticate('facebook'));

// Callback route for facebook to redirect to
router.get(
  '/facebook/redirect',
  passportAuthenticate('facebook'),
  signupOAuth('FACEBOOK')
);

// Auth with Github
router.get('/github', passport.authenticate('github'));

// Callback route for github to redirect to
router.get('/github/redirect', passportAuthenticate('github'), signupOAuth('GITHUB'));

module.exports = router;
