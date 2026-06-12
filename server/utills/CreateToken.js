import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const createToken = (id) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ id }, jwtSecretKey, { expiresIn: '1d' });
};

export { createToken };