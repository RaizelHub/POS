import express from 'express';
import { getTotalSalesDetails } from '../Controller/salesController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

// Route to get total sales details
router.get('/total-sales-details', requireAuth, requireManager, getTotalSalesDetails);

export default router;
