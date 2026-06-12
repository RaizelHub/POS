import express from 'express';
import { confirmPayLaterPayment } from '../Controller/transactionController.js';

const router = express.Router();

router.post('/pay-later/confirm', confirmPayLaterPayment);
    
export default router;
