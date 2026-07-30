import mongoose from 'mongoose';

const receiptSettingsSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    storeName: { type: String, default: 'SUELTO Store' },
    address: { type: String, default: 'SUELTO Retail Station' },
    contactNumber: { type: String, default: '09123456789' },
    vatNumber: { type: String, default: '123-456-789-000' },
    headerMessage: { type: String, default: 'Thank you for shopping!' },
    footerMessage: { type: String, default: 'Please come again!' },
    showLogo: { type: Boolean, default: true },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  },
  { timestamps: true }
);

receiptSettingsSchema.index({ organizationId: 1, branchId: 1 }, { unique: true });

const ReceiptSettings = mongoose.model('ReceiptSettings', receiptSettingsSchema);
export default ReceiptSettings;
