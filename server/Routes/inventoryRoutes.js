import express from 'express';
import {
  adjustInventory,
  getInventoryMovements,
  receiveInventory,
  recordCycleCount,
} from '../Controller/inventoryController.js';
import { requireAuth, requireManager, requireSupervisor } from '../Middleware/authorize.js';

const router = express.Router();
router.use(requireAuth);
router.get('/inventory/movements', requireManager, getInventoryMovements);
router.post('/inventory/:productId/receive', requireManager, receiveInventory);
router.post('/inventory/:productId/adjust', requireSupervisor, adjustInventory);
router.post('/inventory/:productId/cycle-count', requireManager, recordCycleCount);

export default router;

