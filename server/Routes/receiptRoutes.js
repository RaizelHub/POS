import express from 'express';
import { body, validationResult } from 'express-validator';
import { createReceipt } from '../Controller/receiptController.js';

const router = express.Router();

// Validation middleware
router.post(
  '/generate-receipt',
  [
    body('isMultipleProducts').isBoolean().withMessage('isMultipleProducts flag is required'),
    body('totalPrice').isFloat({ gt: 0 }).withMessage('Total price must be positive'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('user.email').isEmail().withMessage('Valid user email is required'),
    body('user.firstname').notEmpty().withMessage('User first name is required'),
    body('user.lastname').notEmpty().withMessage('User last name is required'),
    // Conditional validation based on isMultipleProducts
    body('product.name').if(body('isMultipleProducts').equals('false'))
      .notEmpty().withMessage('Product name is required for single product'),
    body('product.price').if(body('isMultipleProducts').equals('false'))
      .isFloat({ gt: 0 }).withMessage('Product price must be positive for single product'),
    body('quantity').if(body('isMultipleProducts').equals('false'))
      .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer for single product'),
    body('products').if(body('isMultipleProducts').equals('true'))
      .isArray().withMessage('Products array is required for multiple products'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createReceipt
);

export default router;
