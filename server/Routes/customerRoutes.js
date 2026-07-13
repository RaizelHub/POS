import express from 'express';
import { createCustomer, searchCustomers, getCustomers, getCustomerById } from '../Controller/customerController.js';

const router = express.Router();

router.post('/customers', createCustomer);
router.get('/customers/search', searchCustomers);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

export default router;
