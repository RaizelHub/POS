import bcrypt from 'bcryptjs';

const enteredPin = '098765'; // PIN you're testing
const hashedPinFromDB = '$2b$10$exQJkOoiF2Y3f3E2sV9SB.q4wU53kJbald4yMALwS1yMtsPOi26j6'; // Hashed PIN from DB

bcrypt.compare(enteredPin, hashedPinFromDB)
  .then(isMatch => {
    console.log('Does the entered PIN match the stored hash?', isMatch); // true or false
  })
  .catch(err => console.error('Error comparing PIN:', err));