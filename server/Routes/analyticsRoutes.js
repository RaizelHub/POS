import express from 'express';
import { getDashboardAnalytics } from '../Controller/analyticsController.js';
import { requireAuth, requireManager } from '../Middleware/authorize.js';

const router = express.Router();

router.get('/analytics', requireAuth, requireManager, getDashboardAnalytics);

export default router;
