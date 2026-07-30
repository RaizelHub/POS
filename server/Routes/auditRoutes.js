import express from 'express';
import { getAuditLogs } from '../Controller/auditController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();
router.get('/audit-logs', requireAuth, requireManager, getAuditLogs);

export default router;

