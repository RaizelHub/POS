import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    summary: { type: String, trim: true, maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

