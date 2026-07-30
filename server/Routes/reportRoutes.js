import express from 'express';
import { getShiftReconciliation } from '../Controller/reportController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();
router.get('/reports/shifts/:shiftId/reconciliation', requireAuth, requireManager, getShiftReconciliation);

export default router;

