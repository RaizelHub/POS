import express from 'express';
import { 
  registerProduct, 
  getProduct, 
  getProductbyId, 
  updateProduct, 
  deleteProduct,
  getProductByBarcode,
  getLowStockProducts
} from '../Controller/productsController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

// Define routes
router.post('/registerProduct', requireAuth, requireManager, registerProduct);
router.get('/products', requireAuth, getProduct);
router.get('/products/low-stock', requireAuth, requireManager, getLowStockProducts);
router.get('/products/barcode/:barcode', requireAuth, getProductByBarcode);
router.get('/products/:id', requireAuth, getProductbyId);
router.put('/products/:id', requireAuth, requireManager, updateProduct);
router.delete('/products/:id', requireAuth, requireManager, deleteProduct);

export default router;
