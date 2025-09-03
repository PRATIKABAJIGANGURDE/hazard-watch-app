import pool from '../config/database.js';
import { Report, CreateReportData, QueryFilters, ReportCluster } from '../types/index.js';

export class ReportModel {
  static async create(userId: string, reportData: CreateReportData): Promise<Report> {
    const { event_type, description, longitude, latitude, location_name, media_urls = [] } = reportData;
    
    const query = `
      INSERT INTO reports (user_id, event_type, description, geom, location_name, media_urls)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
      RETURNING 
        id, user_id, event_type, description, 
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        location_name, media_urls, verified, verified_by, verified_at,
        timestamp, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      userId, event_type, description, longitude, latitude, location_name, media_urls
    ]);
    
    return result.rows[0];
  }

  static async findAll(filters: QueryFilters = {}): Promise<Report[]> {
    let query = `
      SELECT 
        r.id, r.user_id, r.event_type, r.description,
        ST_X(r.geom) as longitude, ST_Y(r.geom) as latitude,
        r.location_name, r.media_urls, r.verified, r.verified_by, r.verified_at,
        r.timestamp, r.created_at, r.updated_at,
        u.name as reporter_name
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (filters.bbox) {
      paramCount++;
      query += ` AND ST_Within(r.geom, ST_MakeEnvelope($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, 4326))`;
      params.push(filters.bbox.minLon, filters.bbox.minLat, filters.bbox.maxLon, filters.bbox.maxLat);
      paramCount += 3;
    }

    if (filters.event_type) {
      paramCount++;
      query += ` AND r.event_type = $${paramCount}`;
      params.push(filters.event_type);
    }

    if (filters.verified !== undefined) {
      paramCount++;
      query += ` AND r.verified = $${paramCount}`;
      params.push(filters.verified);
    }

    if (filters.start_date) {
      paramCount++;
      query += ` AND r.timestamp >= $${paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      query += ` AND r.timestamp <= $${paramCount}`;
      params.push(filters.end_date);
    }

    query += ` ORDER BY r.timestamp DESC`;

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: string): Promise<Report | null> {
    const query = `
      SELECT 
        r.id, r.user_id, r.event_type, r.description,
        ST_X(r.geom) as longitude, ST_Y(r.geom) as latitude,
        r.location_name, r.media_urls, r.verified, r.verified_by, r.verified_at,
        r.timestamp, r.created_at, r.updated_at,
        u.name as reporter_name
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async verify(reportId: string, verifiedBy: string): Promise<Report | null> {
    const query = `
      UPDATE reports 
      SET verified = true, verified_by = $1, verified_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id, user_id, event_type, description,
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        location_name, media_urls, verified, verified_by, verified_at,
        timestamp, created_at, updated_at
    `;
    
    const result = await pool.query(query, [verifiedBy, reportId]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit = 50, offset = 0): Promise<Report[]> {
    const query = `
      SELECT 
        r.id, r.user_id, r.event_type, r.description,
        ST_X(r.geom) as longitude, ST_Y(r.geom) as latitude,
        r.location_name, r.media_urls, r.verified, r.verified_by, r.verified_at,
        r.timestamp, r.created_at, r.updated_at
      FROM reports r
      WHERE r.user_id = $1
      ORDER BY r.timestamp DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async getClusters(clusterCount = 5, minDate?: Date): Promise<ReportCluster[]> {
    const minDateParam = minDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const result = await pool.query(
      'SELECT * FROM get_report_clusters($1, $2)',
      [clusterCount, minDateParam]
    );
    
    return result.rows;
  }

  static async getStats(): Promise<any> {
    const queries = [
      // Total reports
      'SELECT COUNT(*) as total_reports FROM reports',
      
      // Unverified reports
      'SELECT COUNT(*) as unverified_reports FROM reports WHERE verified = false',
      
      // Reports today
      `SELECT COUNT(*) as reports_today FROM reports 
       WHERE timestamp >= CURRENT_DATE`,
      
      // Reports this week
      `SELECT COUNT(*) as reports_this_week FROM reports 
       WHERE timestamp >= date_trunc('week', CURRENT_DATE)`,
      
      // Event type breakdown
      `SELECT event_type, COUNT(*) as count FROM reports 
       GROUP BY event_type ORDER BY count DESC`
    ];

    const results = await Promise.all(
      queries.map(query => pool.query(query))
    );

    const eventTypeBreakdown: Record<string, number> = {};
    results[4].rows.forEach(row => {
      eventTypeBreakdown[row.event_type] = parseInt(row.count);
    });

    return {
      total_reports: parseInt(results[0].rows[0].total_reports),
      unverified_reports: parseInt(results[1].rows[0].unverified_reports),
      reports_today: parseInt(results[2].rows[0].reports_today),
      reports_this_week: parseInt(results[3].rows[0].reports_this_week),
      event_type_breakdown: eventTypeBreakdown,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM reports WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
}