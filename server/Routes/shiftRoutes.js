import express from 'express';
import { openShift, closeShift, getActiveShift, getShifts, addCashLog, getCashLogs } from '../Controller/shiftController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.post('/shifts/open', requireAuth, openShift);
router.post('/shifts/close', requireAuth, closeShift);
router.get('/shifts/active/:cashierId', requireAuth, getActiveShift);
router.get('/shifts', requireAuth, requireManager, getShifts);

router.post('/shifts/:shiftId/cash-logs', requireAuth, addCashLog);
router.get('/shifts/:shiftId/cash-logs', requireAuth, getCashLogs);

export default router;
