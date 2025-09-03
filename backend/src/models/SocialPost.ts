import pool from '../config/database.js';
import { SocialPost } from '../types/index.js';

export class SocialPostModel {
  static async create(postData: Omit<SocialPost, 'id' | 'created_at'>): Promise<SocialPost> {
    const { platform, post_id, text, author, longitude, latitude, sentiment, timestamp } = postData;
    
    const geomValue = longitude && latitude 
      ? `ST_SetSRID(ST_MakePoint($7, $8), 4326)`
      : 'NULL';
    
    const query = `
      INSERT INTO social_posts (platform, post_id, text, author, geom, sentiment, timestamp)
      VALUES ($1, $2, $3, $4, ${geomValue}, $5, $6)
      RETURNING 
        id, platform, post_id, text, author,
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        sentiment, timestamp, created_at
    `;
    
    const params = longitude && latitude 
      ? [platform, post_id, text, author, sentiment, timestamp, longitude, latitude]
      : [platform, post_id, text, author, sentiment, timestamp];
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async findAll(limit = 50, offset = 0): Promise<SocialPost[]> {
    const query = `
      SELECT 
        id, platform, post_id, text, author,
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        sentiment, timestamp, created_at
      FROM social_posts
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByPlatform(platform: string, limit = 50): Promise<SocialPost[]> {
    const query = `
      SELECT 
        id, platform, post_id, text, author,
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        sentiment, timestamp, created_at
      FROM social_posts
      WHERE platform = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [platform, limit]);
    return result.rows;
  }

  static async findByLocation(longitude: number, latitude: number, radiusKm = 50, limit = 50): Promise<SocialPost[]> {
    const query = `
      SELECT 
        id, platform, post_id, text, author,
        ST_X(geom) as longitude, ST_Y(geom) as latitude,
        sentiment, timestamp, created_at,
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 as distance_km
      FROM social_posts
      WHERE geom IS NOT NULL
      AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3 * 1000)
      ORDER BY distance_km ASC
      LIMIT $4
    `;
    
    const result = await pool.query(query, [longitude, latitude, radiusKm, limit]);
    return result.rows;
  }

  // Mock data for Phase 1 (since social media integration is Phase 2)
  static async getMockTrends(): Promise<SocialPost[]> {
    const mockPosts: SocialPost[] = [
      {
        id: 'mock-1',
        platform: 'twitter',
        post_id: 'mock_tweet_1',
        text: 'Unusual high waves observed near Marina Beach, Chennai. Fishermen advised to stay cautious. #ChennaiWeather #MarinaSafety',
        author: '@ChennaiWeatherAlert',
        longitude: 80.2707,
        latitude: 13.0827,
        sentiment: 'negative',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        created_at: new Date()
      },
      {
        id: 'mock-2',
        platform: 'facebook',
        post_id: 'mock_fb_1',
        text: 'Beautiful calm seas today at Kochi harbor. Perfect weather for fishing! 🌊⛵',
        author: 'Kochi Fishermen Association',
        longitude: 76.2673,
        latitude: 9.9312,
        sentiment: 'positive',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        created_at: new Date()
      },
      {
        id: 'mock-3',
        platform: 'twitter',
        post_id: 'mock_tweet_2',
        text: 'INCOIS issues advisory for rough sea conditions along Karnataka coast. Fishermen advised not to venture into sea.',
        author: '@INCOIS_Official',
        longitude: 74.8560,
        latitude: 12.9716,
        sentiment: 'neutral',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        created_at: new Date()
      }
    ];

    return mockPosts;
  }
}