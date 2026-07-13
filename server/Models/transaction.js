import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the schema for the Transaction
const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },

  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      totalPrice: { type: Number, required: true },
      paymentStatus: {  
        type: String,
        enum: ['Paid', 'Pay Later'],
        default: 'Pay Later', // Default value for paymentStatus
        required: true
      },
      paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'GCash/PayMaya', 'Split', 'Pay Later'],
        default: 'Pay Later'
      }
    }
  ],

  paymentMethod: {
    type: String, 
    enum: ['Cash', 'Card', 'GCash/PayMaya', 'Split', 'Pay Later'], 
    required: true 
  },

  transactionDate: { 
    type: Date, 
    default: Date.now
  },

  transactionId: { 
    type: String, 
    default: () => uuidv4() 
  },

  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  originalAmount: {
    type: Number,
    default: 0,
  },
  promoCode: {
    type: String,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
  },
  loyaltyPointsRedeemed: {
    type: Number,
    default: 0,
  },
  splitDetails: {
    cashAmount: { type: Number, default: 0 },
    digitalAmount: { type: Number, default: 0 },
  },
});

transactionSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
