import express from 'express';
import { 
  registerProduct, 
  getProduct, 
  getProductbyId, 
  updateProduct, 
  deleteProduct,
  getProductByBarcode,
  decrementProductQuantity,
  deleteAllProducts 
} from '../Controller/productsController.js'; // Fix the controller import path

const router = express.Router();

// Define routes
router.post('/registerProduct', registerProduct);
router.get('/products', getProduct);
router.get('/products/:id', getProductbyId);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/barcode/:barcode', getProductByBarcode);
router.put('/products/:id/decrement', decrementProductQuantity);
router.delete('/products', deleteAllProducts);

export default router;
