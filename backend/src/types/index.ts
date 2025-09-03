export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'analyst' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'citizen' | 'analyst' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Report {
  id: string;
  user_id: string;
  event_type: 'high_wave' | 'flood' | 'tsunami' | 'unusual_tide' | 'other';
  description: string;
  longitude: number;
  latitude: number;
  location_name?: string;
  media_urls: string[];
  verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReportData {
  event_type: 'high_wave' | 'flood' | 'tsunami' | 'unusual_tide' | 'other';
  description: string;
  longitude: number;
  latitude: number;
  location_name?: string;
  media_urls?: string[];
}

export interface SocialPost {
  id: string;
  platform: string;
  post_id: string;
  text: string;
  author: string;
  longitude?: number;
  latitude?: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
  created_at: Date;
}

export interface ReportCluster {
  cluster_id: number;
  event_type: 'high_wave' | 'flood' | 'tsunami' | 'unusual_tide' | 'other';
  report_count: number;
  center_lat: number;
  center_lon: number;
}

export interface DashboardStats {
  total_reports: number;
  unverified_reports: number;
  reports_today: number;
  reports_this_week: number;
  event_type_breakdown: Record<string, number>;
  hotspots: ReportCluster[];
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface QueryFilters {
  bbox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  event_type?: string;
  verified?: boolean;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}