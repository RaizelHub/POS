import AuditLog from '../Models/auditLog.js';

export const getAuditLogs = async (req, res) => {
  const query = {
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
  };
  if (req.query.action) query.action = req.query.action;
  if (req.query.entityType) query.entityType = req.query.entityType;

  const logs = await AuditLog.find(query)
    .populate('actorId', 'firstname lastname email role')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 100, 500));
  return res.json(logs);
};

