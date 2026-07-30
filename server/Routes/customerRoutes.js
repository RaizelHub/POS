import express from 'express';
import { createCustomer, searchCustomers, getCustomers, getCustomerById } from '../Controller/customerController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.use(requireAuth);
router.post('/customers', createCustomer);
router.get('/customers/search', searchCustomers);
router.get('/customers', requireManager, getCustomers);
router.get('/customers/:id', getCustomerById);

export default router;
