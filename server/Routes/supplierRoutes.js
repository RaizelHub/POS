import express from 'express';
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from '../Controller/supplierController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.get('/suppliers', requireAuth, requireManager, getSuppliers);
router.post('/suppliers', requireAuth, requireManager, createSupplier);
router.put('/suppliers/:id', requireAuth, requireManager, updateSupplier);
router.delete('/suppliers/:id', requireAuth, requireManager, deleteSupplier);

export default router;
