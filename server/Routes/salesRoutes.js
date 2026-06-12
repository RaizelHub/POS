import express from 'express';
import { getTotalSalesDetails, createOrUpdateSales} from '../Controller/salesController.js';

const router = express.Router();

// Route to get total sales details
router.get('/total-sales-details', getTotalSalesDetails);
router.post('/create-or-update', createOrUpdateSales);


export default router;