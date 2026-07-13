import express from 'express';
import { openShift, closeShift, getActiveShift, getShifts, addCashLog, getCashLogs } from '../Controller/shiftController.js';

const router = express.Router();

router.post('/shifts/open', openShift);
router.post('/shifts/close', closeShift);
router.get('/shifts/active/:cashierId', getActiveShift);
router.get('/shifts', getShifts);

router.post('/shifts/:shiftId/cash-logs', addCashLog);
router.get('/shifts/:shiftId/cash-logs', getCashLogs);

export default router;
