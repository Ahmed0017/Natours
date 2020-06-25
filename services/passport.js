const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const GithubStrategy = require('passport-github');

// const {
//   google: { clientID, clientSecret },
//   facebook: { AppId, AppSecret },
//   github: { githubId, githubSecret }
// } = require('../config');

const addPassportStrategy = (Strategy, options) => {
  passport.use(
    new Strategy(
      // Options for the strategy
      options,
      async (accessToken, refreshToken, profile, cb) => {
        return cb(null, profile);
      }
    )
  );
};

addPassportStrategy(GoogleStrategy, {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/redirect'
});

addPassportStrategy(FacebookStrategy, {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/redirect',
  profileFields: ['id', 'displayName', 'photos', 'email']
});

addPassportStrategy(GithubStrategy, {
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: '/auth/github/redirect',
  scope: 'user:email'
});
