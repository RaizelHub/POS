import express from 'express';
import { getDashboardAnalytics, getCashierLeaderboard } from '../Controller/analyticsController.js';

const router = express.Router();

router.get('/analytics', getDashboardAnalytics);
router.get('/analytics/cashier-leaderboard', getCashierLeaderboard);

export default router;
