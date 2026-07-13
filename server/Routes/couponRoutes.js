import express from 'express';
import { createCoupon, getCoupons, validateCoupon } from '../Controller/couponController.js';

const router = express.Router();

router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.get('/coupons/validate/:code', validateCoupon);

export default router;
