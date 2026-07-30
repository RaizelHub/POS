import express from 'express';
import { createCoupon, getCoupons, validateCoupon } from '../Controller/couponController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.use(requireAuth);
router.post('/coupons', requireManager, createCoupon);
router.get('/coupons', requireManager, getCoupons);
router.get('/coupons/validate/:code', validateCoupon);

export default router;
