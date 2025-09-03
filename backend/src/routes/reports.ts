import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticateToken, requireAnalystOrAdmin } from '../middleware/auth.js';
import { validate, createReportSchema, validateQuery, queryFiltersSchema } from '../middleware/validation.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', validateQuery(queryFiltersSchema), ReportController.getReports);
router.get('/hotspots', ReportController.getHotspots);
router.get('/:id', ReportController.getReportById);

// Protected routes - require authentication
router.use(authenticateToken);

// Create new report (citizens, analysts, admins)
router.post('/', 
  upload.array('media', 5), 
  handleUploadError,
  validate(createReportSchema), 
  ReportController.createReport
);

// Get user's own reports
router.get('/user/my-reports', ReportController.getUserReports);

// Analyst/Admin only routes
router.patch('/:id/verify', requireAnalystOrAdmin, ReportController.verifyReport);
router.delete('/:id', ReportController.deleteReport);

export default router;