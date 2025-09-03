import { Router } from 'express';
import authRoutes from './auth.js';
import reportRoutes from './reports.js';
import socialRoutes from './social.js';
import dashboardRoutes from './dashboard.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    service: 'INCOIS Hazard Reporting API'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/social', socialRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;