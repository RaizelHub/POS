import express from 'express';
import { confirmPayLaterPayment, getAllTransactionsLedger } from '../Controller/transactionController.js';

const router = express.Router();

router.post('/pay-later/confirm', confirmPayLaterPayment);
router.get('/ledger', getAllTransactionsLedger);
    
export default router;
