import mongoose from 'mongoose';

// Define the schema for daily sales data
const salesSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },  // Store the specific date for the record
  totalSales: { type: Number, default: 0 },
  paidSales: { type: Number, default: 0 },  // For Paid sales
  payLaterSales: { type: Number, default: 0 },  // For Pay Later sales
  salesDetails: [
    {
      productName: { type: String, required: true },
      quantitySold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      buyers: [String],  // List of buyer names or IDs
    }
  ]
});

// Create the model
const Sales = mongoose.model('Sales', salesSchema);

export default Sales;
