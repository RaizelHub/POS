import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the schema for the Transaction
const transactionSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    default: 'default',
    index: true,
  },
  branchId: {
    type: String,
    default: 'main',
    index: true,
  },
  registerId: {
    type: String,
    default: 'register-01',
    index: true,
  },
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
      unitPriceCents: { type: Number, min: 0 },
      totalPriceCents: { type: Number, min: 0 },
      discountAllocationCents: { type: Number, min: 0, default: 0 },
      netTotalPriceCents: { type: Number, min: 0 },
      refundedAmountCents: { type: Number, min: 0, default: 0 },
      returnedQuantity: { type: Number, min: 0, default: 0 },
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
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pay Later'],
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'partially_refunded', 'refunded', 'voided'],
    default: 'completed',
    index: true,
  },

  transactionDate: { 
    type: Date, 
    default: Date.now
  },

  transactionId: { 
    type: String, 
    default: () => uuidv4(),
    unique: true,
    index: true,
  },
  idempotencyKey: {
    type: String,
    sparse: true,
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
  subtotalCents: {
    type: Number,
    min: 0,
    default: 0,
  },
  discountAmountCents: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalAmountCents: {
    type: Number,
    min: 0,
    default: 0,
  },
  amountPaidCents: {
    type: Number,
    min: 0,
    default: 0,
  },
  balanceDueCents: {
    type: Number,
    min: 0,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
  refundTotalCents: {
    type: Number,
    min: 0,
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
    cashAmountCents: { type: Number, default: 0 },
    digitalAmountCents: { type: Number, default: 0 },
  },
  tenderReference: {
    type: String,
    trim: true,
    maxlength: 100,
  },
});

transactionSchema.index(
  { organizationId: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);
transactionSchema.index({ organizationId: 1, branchId: 1, transactionDate: -1 });

transactionSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
