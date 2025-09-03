import { Request, Response } from 'express';
import { ReportModel } from '../models/Report.js';
import { AuthenticatedRequest, CreateReportData, QueryFilters } from '../types/index.js';
import path from 'path';

export class ReportController {
  static async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const reportData: CreateReportData = req.body;
      
      // Handle uploaded files
      const files = req.files as Express.Multer.File[];
      const media_urls: string[] = [];
      
      if (files && files.length > 0) {
        for (const file of files) {
          // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
          // For now, we'll store local file paths
          const fileUrl = `/api/uploads/${file.filename}`;
          media_urls.push(fileUrl);
        }
      }

      // Add media URLs to report data
      reportData.media_urls = media_urls;

      const report = await ReportModel.create(user.id, reportData);

      res.status(201).json({
        message: 'Report submitted successfully',
        report
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  }

  static async getReports(req: Request, res: Response): Promise<void> {
    try {
      // Parse query filters
      const filters: QueryFilters = {};
      
      if (req.query.bbox) {
        const bboxStr = req.query.bbox as string;
        const [minLon, minLat, maxLon, maxLat] = bboxStr.split(',').map(Number);
        filters.bbox = { minLon, minLat, maxLon, maxLat };
      }

      if (req.query.event_type) {
        filters.event_type = req.query.event_type as string;
      }

      if (req.query.verified !== undefined) {
        filters.verified = req.query.verified === 'true';
      }

      if (req.query.start_date) {
        filters.start_date = new Date(req.query.start_date as string);
      }

      if (req.query.end_date) {
        filters.end_date = new Date(req.query.end_date as string);
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }

      const reports = await ReportModel.findAll(filters);

      res.json({
        reports,
        count: reports.length,
        filters
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await ReportModel.findById(id);

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json({ report });
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  }

  static async verifyReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Only analysts and admins can verify reports
      if (!['analyst', 'admin'].includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions to verify reports' });
        return;
      }

      const report = await ReportModel.verify(id, user.id);

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json({
        message: 'Report verified successfully',
        report
      });
    } catch (error) {
      console.error('Verify report error:', error);
      res.status(500).json({ error: 'Failed to verify report' });
    }
  }

  static async getUserReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const reports = await ReportModel.findByUserId(user.id, limit, offset);

      res.json({
        reports,
        count: reports.length
      });
    } catch (error) {
      console.error('Get user reports error:', error);
      res.status(500).json({ error: 'Failed to fetch user reports' });
    }
  }

  static async deleteReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Get the report to check ownership
      const report = await ReportModel.findById(id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Only allow deletion by report owner or admin
      if (report.user_id !== user.id && user.role !== 'admin') {
        res.status(403).json({ error: 'Insufficient permissions to delete this report' });
        return;
      }

      const deleted = await ReportModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  }

  static async getHotspots(req: Request, res: Response): Promise<void> {
    try {
      const clusterCount = parseInt(req.query.clusters as string) || 5;
      const daysBack = parseInt(req.query.days as string) || 30;
      const minDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      const clusters = await ReportModel.getClusters(clusterCount, minDate);

      res.json({
        hotspots: clusters,
        parameters: {
          cluster_count: clusterCount,
          days_back: daysBack,
          min_date: minDate
        }
      });
    } catch (error) {
      console.error('Get hotspots error:', error);
      res.status(500).json({ error: 'Failed to fetch hotspots' });
    }
  }
}