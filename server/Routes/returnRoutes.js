import express from 'express';
import { getReturns, returnTransactionItems, voidTransaction } from '../Controller/returnController.js';
import { requireAuth, requireManager, requireSupervisor } from '../Middleware/authorize.js';

const router = express.Router();
router.use(requireAuth);
router.get('/returns', requireManager, getReturns);
router.post('/transactions/:transactionId/returns', requireSupervisor, returnTransactionItems);
router.post('/transactions/:transactionId/void', requireManager, voidTransaction);

export default router;

