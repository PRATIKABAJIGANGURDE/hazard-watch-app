import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken, requireAnalystOrAdmin, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Analyst and Admin routes
router.get('/stats', requireAnalystOrAdmin, DashboardController.getStats);
router.get('/analytics', requireAnalystOrAdmin, DashboardController.getAnalytics);

// Admin only routes
router.get('/export/reports', requireAdmin, DashboardController.exportReports);

export default router;