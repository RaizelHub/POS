import nodemailer from 'nodemailer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../Models/user.js';
import bcrypt from 'bcryptjs';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false  // Ensure the TLS connection is accepted
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/oauth2callback`,
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserModel.findOne({ googleId: profile.id });

    if (!user) {
      const imageUrl = profile.photos[0]?.value || 'https://path/to/default-image.jpg';

      const defaultPin = '123456'; // Example default PIN
      const hashedPin = await bcrypt.hash(defaultPin, 10);

      user = new UserModel({
        googleId: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: imageUrl,
        pin: hashedPin, // Default PIN
        isVerified: true,
      });

      await user.save();

      console.log('User created:', user);  // Check if user is saved
      // Hash PIN before saving
      user.pin = await bcrypt.hash(user.pin, 10);
      // Send email logic
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Default PIN',
        text: `Hello ${user.firstname},\n\nYour account has been successfully created. Your default PIN is: 123456\n\nPlease change your PIN after logging in.\n\nWelcome,\nEnjoy!!!`,
      };

      console.log('Sending email...');  // Log before email is sent
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    done(null, user);
  } catch (err) {
    console.error('Error in Google OAuth:', err);
    done(err, false, { message: 'Error while finding or creating user' });
  }
}));

// Serialize user to session, saving user ID
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;







