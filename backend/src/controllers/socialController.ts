import { Request, Response } from 'express';
import { SocialPostModel } from '../models/SocialPost.js';

export class SocialController {
  static async getTrends(req: Request, res: Response): Promise<void> {
    try {
      // For Phase 1, return mock data
      // In Phase 2, this will integrate with real social media APIs
      const mockTrends = await SocialPostModel.getMockTrends();

      res.json({
        message: 'Social media trends (Phase 1 - Mock Data)',
        trends: mockTrends,
        note: 'This is mock data for Phase 1. Phase 2 will include real social media integration with NLP sentiment analysis.'
      });
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({ error: 'Failed to fetch social media trends' });
    }
  }

  static async getSocialPosts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const platform = req.query.platform as string;

      let posts;
      if (platform) {
        posts = await SocialPostModel.findByPlatform(platform, limit);
      } else {
        posts = await SocialPostModel.findAll(limit, offset);
      }

      res.json({
        posts,
        count: posts.length,
        platform: platform || 'all'
      });
    } catch (error) {
      console.error('Get social posts error:', error);
      res.status(500).json({ error: 'Failed to fetch social posts' });
    }
  }

  static async getPostsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const longitude = parseFloat(req.query.lng as string);
      const latitude = parseFloat(req.query.lat as string);
      const radius = parseInt(req.query.radius as string) || 50; // km
      const limit = parseInt(req.query.limit as string) || 50;

      if (isNaN(longitude) || isNaN(latitude)) {
        res.status(400).json({ error: 'Valid longitude and latitude required' });
        return;
      }

      const posts = await SocialPostModel.findByLocation(longitude, latitude, radius, limit);

      res.json({
        posts,
        count: posts.length,
        location: { longitude, latitude },
        radius_km: radius
      });
    } catch (error) {
      console.error('Get posts by location error:', error);
      res.status(500).json({ error: 'Failed to fetch posts by location' });
    }
  }
}