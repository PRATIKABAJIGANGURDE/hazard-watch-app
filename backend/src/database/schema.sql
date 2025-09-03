-- INCOIS Hazard Reporting Database Schema
-- Designed for Neon PostgreSQL with PostGIS extension

-- Enable PostGIS extension for spatial data support
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('citizen', 'analyst', 'admin');
CREATE TYPE event_type AS ENUM ('high_wave', 'flood', 'tsunami', 'unusual_tide', 'other');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table with spatial data support
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    description TEXT NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL, -- Lat/Lon coordinates in WGS84
    location_name VARCHAR(500), -- Reverse geocoded location name
    media_urls TEXT[] DEFAULT '{}', -- Array of uploaded media file URLs
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social posts table (for Phase 2 social media integration)
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', 'youtube', etc.
    post_id VARCHAR(255) NOT NULL, -- External platform post ID
    text TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    geom GEOMETRY(Point, 4326), -- Optional geotag
    sentiment sentiment_type DEFAULT 'neutral',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, post_id)
);

-- Create spatial indexes for better query performance
CREATE INDEX idx_reports_geom ON reports USING GIST (geom);
CREATE INDEX idx_social_posts_geom ON social_posts USING GIST (geom);

-- Create regular indexes for common queries
CREATE INDEX idx_reports_event_type ON reports(event_type);
CREATE INDEX idx_reports_timestamp ON reports(timestamp DESC);
CREATE INDEX idx_reports_verified ON reports(verified);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_timestamp ON social_posts(timestamp DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for clustering hotspots (Phase 1 stretch goal)
CREATE OR REPLACE FUNCTION get_report_clusters(
    cluster_count INTEGER DEFAULT 5,
    min_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE(
    cluster_id INTEGER,
    event_type event_type,
    report_count BIGINT,
    center_lat DOUBLE PRECISION,
    center_lon DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    WITH clustered_reports AS (
        SELECT 
            r.event_type,
            ST_ClusterKMeans(r.geom, cluster_count) OVER (PARTITION BY r.event_type) as cluster_id,
            r.geom
        FROM reports r
        WHERE r.timestamp >= min_date
        AND r.verified = TRUE
    )
    SELECT 
        cr.cluster_id::INTEGER,
        cr.event_type,
        COUNT(*)::BIGINT as report_count,
        ST_Y(ST_Centroid(ST_Collect(cr.geom)))::DOUBLE PRECISION as center_lat,
        ST_X(ST_Centroid(ST_Collect(cr.geom)))::DOUBLE PRECISION as center_lon
    FROM clustered_reports cr
    GROUP BY cr.cluster_id, cr.event_type
    ORDER BY report_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@incois.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Create view for public report data (excludes sensitive user info)
CREATE VIEW public_reports AS
SELECT 
    r.id,
    r.event_type,
    r.description,
    ST_X(r.geom) as longitude,
    ST_Y(r.geom) as latitude,
    r.location_name,
    r.media_urls,
    r.verified,
    r.timestamp,
    u.name as reporter_name
FROM reports r
JOIN users u ON r.user_id = u.id
WHERE r.verified = TRUE;