import { google } from 'googleapis';
import readline from 'readline';
import connectDB from '../db';

connectDB()

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes you need
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const getAuthUrl = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  rl.question('Enter the code from that page here: ', (code) => {
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        console.log('Error retrieving access token', err);
        return;
      }
      oauth2Client.setCredentials(tokens);
      console.log('Your refresh token:', tokens.refresh_token);
      rl.close();
    });
  });
};

getAuthUrl();
