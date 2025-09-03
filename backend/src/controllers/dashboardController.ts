import { Request, Response } from 'express';
import { ReportModel } from '../models/Report.js';
import { UserModel } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../config/database.js';

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      // Only analysts and admins can access dashboard stats
      if (!['analyst', 'admin'].includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions to access dashboard' });
        return;
      }

      const stats = await ReportModel.getStats();
      const hotspots = await ReportModel.getClusters(5);

      res.json({
        ...stats,
        hotspots
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }

  static async exportReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      // Only admins can export full dataset
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required for data export' });
        return;
      }

      const format = req.query.format as string || 'json';
      const verified_only = req.query.verified_only === 'true';

      let query = `
        SELECT 
          r.id, r.event_type, r.description,
          ST_X(r.geom) as longitude, ST_Y(r.geom) as latitude,
          r.location_name, r.media_urls, r.verified, r.timestamp,
          u.name as reporter_name, u.email as reporter_email
        FROM reports r
        JOIN users u ON r.user_id = u.id
      `;

      if (verified_only) {
        query += ' WHERE r.verified = true';
      }

      query += ' ORDER BY r.timestamp DESC';

      const result = await pool.query(query);
      const reports = result.rows;

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = [
          'ID', 'Event Type', 'Description', 'Longitude', 'Latitude', 
          'Location Name', 'Media URLs', 'Verified', 'Timestamp', 
          'Reporter Name', 'Reporter Email'
        ];

        const csvRows = reports.map(report => [
          report.id,
          report.event_type,
          `"${report.description.replace(/"/g, '""')}"`, // Escape quotes in description
          report.longitude,
          report.latitude,
          report.location_name || '',
          `"${report.media_urls.join(';')}"`,
          report.verified,
          report.timestamp,
          report.reporter_name,
          report.reporter_email
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=hazard_reports_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
      } else {
        // JSON format
        res.json({
          reports,
          count: reports.length,
          exported_at: new Date(),
          exported_by: user.email
        });
      }
    } catch (error) {
      console.error('Export reports error:', error);
      res.status(500).json({ error: 'Failed to export reports' });
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!['analyst', 'admin'].includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Get reports over time (last 30 days)
      const timeSeriesQuery = `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as count,
          event_type
        FROM reports
        WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(timestamp), event_type
        ORDER BY date DESC, event_type
      `;

      // Get verification stats
      const verificationQuery = `
        SELECT 
          verified,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (verified_at - created_at))/3600) as avg_verification_time_hours
        FROM reports
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY verified
      `;

      // Get top reporters
      const topReportersQuery = `
        SELECT 
          u.name,
          u.email,
          COUNT(r.id) as report_count,
          COUNT(CASE WHEN r.verified THEN 1 END) as verified_count
        FROM users u
        JOIN reports r ON u.id = r.user_id
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY u.id, u.name, u.email
        ORDER BY report_count DESC
        LIMIT 10
      `;

      const [timeSeriesResult, verificationResult, topReportersResult] = await Promise.all([
        pool.query(timeSeriesQuery),
        pool.query(verificationQuery),
        pool.query(topReportersQuery)
      ]);

      res.json({
        time_series: timeSeriesResult.rows,
        verification_stats: verificationResult.rows,
        top_reporters: topReportersResult.rows,
        period: 'last_30_days'
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}