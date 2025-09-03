# Neon Database Setup for INCOIS Hazard Reporting

This guide walks you through setting up your Neon PostgreSQL database with PostGIS extension for the INCOIS Hazard Reporting system.

## 🎯 Step-by-Step Setup

### 1. Create Neon Account and Project

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Choose a project name (e.g., "incois-hazard-reporting")
4. Select your preferred region (closest to your users)

### 2. Create Database

1. In your Neon dashboard, go to "Databases"
2. Create a new database (e.g., "hazard_reports")
3. Note down your connection details

### 3. Enable PostGIS Extension

Connect to your Neon database using the SQL Editor or any PostgreSQL client and run:

```sql
-- Enable PostGIS extension for spatial data support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_Version();
```

### 4. Get Connection String

1. In Neon dashboard, go to "Connection Details"
2. Copy the connection string (it should look like):
   ```
   postgresql://username:password@hostname:5432/dbname?sslmode=require
   ```

### 5. Configure Environment

Update your `.env` file with the Neon connection string:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require
```

### 6. Run Migrations

Execute the database schema setup:

```bash
npm run migrate
```

This will create all necessary tables, indexes, and functions.

### 7. Seed Sample Data (Optional)

Populate the database with sample data for testing:

```bash
npm run seed
```

This creates:
- Sample users (citizen, analyst, admin)
- Sample hazard reports
- Verified reports for testing

## 🔍 Verifying Setup

### Test Database Connection

```bash
npm run dev
```

You should see:
```
✅ Connected to Neon PostgreSQL database
✅ Database connection successful
🚀 INCOIS Hazard Reporting API running on port 3001
```

### Test API Endpoints

1. **Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Register User**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Create Report**:
   ```bash
   # First login to get token
   TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}' \
     | jq -r '.token')

   # Submit report
   curl -X POST http://localhost:3001/api/reports \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "event_type": "high_wave",
       "description": "Test hazard report",
       "longitude": 80.2707,
       "latitude": 13.0827,
       "location_name": "Test Location"
     }'
   ```

## 🛠 Neon-Specific Features

### Connection Pooling

Neon automatically handles connection pooling, but our app uses pg Pool for optimal performance:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### SSL Configuration

Neon requires SSL connections. The connection string includes `sslmode=require`.

### PostGIS Spatial Queries

Example spatial queries you can run:

```sql
-- Find reports within 50km of a point
SELECT id, event_type, description, 
       ST_X(geom) as longitude, ST_Y(geom) as latitude
FROM reports 
WHERE ST_DWithin(
  geom, 
  ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography, 
  50000  -- 50km in meters
);

-- Get report clusters
SELECT * FROM get_report_clusters(5, NOW() - INTERVAL '30 days');

-- Find reports in bounding box
SELECT id, event_type, description
FROM reports 
WHERE ST_Within(
  geom, 
  ST_MakeEnvelope(80.0, 13.0, 81.0, 14.0, 4326)
);
```

## 🚨 Troubleshooting

### Common Issues

1. **PostGIS Extension Error**:
   - Ensure PostGIS is enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`
   - Check extension: `SELECT * FROM pg_extension WHERE extname = 'postgis';`

2. **Connection Timeout**:
   - Verify connection string format
   - Check network connectivity
   - Ensure SSL mode is set to `require`

3. **Migration Errors**:
   - Check if database exists
   - Verify user permissions
   - Ensure PostGIS is installed

4. **Spatial Query Errors**:
   - Verify SRID (4326 for WGS84)
   - Check coordinate order (longitude, latitude)
   - Ensure proper geometry casting

### Database Performance

For optimal performance with spatial queries:

1. **Indexes**: Already created in schema.sql
2. **Connection Pooling**: Configured in database.ts
3. **Query Optimization**: Use EXPLAIN ANALYZE for complex queries

## 📊 Monitoring

Monitor your Neon database:

1. **Neon Dashboard**: View connection stats, query performance
2. **Application Logs**: Monitor connection pool status
3. **API Metrics**: Track endpoint response times

## 🔄 Backup and Recovery

Neon provides automatic backups, but for additional safety:

1. **Regular Exports**: Use the admin export endpoint
2. **Schema Backup**: Keep schema.sql in version control
3. **Data Migration**: Document any custom functions or triggers

Your Neon database is now ready for the INCOIS Hazard Reporting system! 🌊