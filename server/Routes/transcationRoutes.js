import express from 'express';
import { confirmPayLaterPayment, getAllTransactionsLedger } from '../Controller/transactionController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.use(requireAuth);
router.post('/pay-later/confirm', confirmPayLaterPayment);
router.get('/ledger', requireManager, getAllTransactionsLedger);
    
export default router;
