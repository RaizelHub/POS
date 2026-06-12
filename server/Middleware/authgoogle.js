import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,  // Match with your route
  },
  (accessToken, refreshToken, profile, done) => {
    // Handle user data after successful authentication
    console.log(profile);
    return done(null, profile);
  }
));
