# 🚀 INCOIS Hazard Reporting Backend - Quick Start

Get the INCOIS Hazard Reporting backend up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Prerequisites
- Node.js 18+ installed
- Neon PostgreSQL database account

### 2. Database Setup
1. Create a Neon project at [neon.tech](https://neon.tech)
2. Create a database and enable PostGIS:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Copy your connection string

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your Neon connection string:
```env
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Install and Run
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

## ✅ Verify Installation

Test the API:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "INCOIS Hazard Reporting API"
}
```

## 🧪 Quick Test

1. **Register a user**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Submit a hazard report**:
```bash
# Get token from registration response, then:
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "event_type": "high_wave",
    "description": "Test hazard report",
    "longitude": 80.2707,
    "latitude": 13.0827,
    "location_name": "Marina Beach, Chennai"
  }'
```

3. **View reports**:
```bash
curl http://localhost:3001/api/reports
```

## 📚 What's Included

✅ **Complete Backend API** with all Phase 1 requirements
✅ **Neon PostgreSQL** with PostGIS spatial support
✅ **JWT Authentication** with role-based access (citizen/analyst/admin)
✅ **File Upload** support for photos and videos
✅ **Real-time Updates** via WebSocket
✅ **Spatial Queries** for hotspot clustering and geographic filtering
✅ **Dashboard Analytics** for analysts and admins
✅ **Rate Limiting** and security middleware
✅ **Mock Social Media** integration (Phase 2 ready)

## 🎯 Key Features

- **Crowdsourced Reports**: Citizens can submit hazard reports with location and media
- **Real-time Feed**: Live updates via WebSocket for immediate awareness
- **Spatial Analysis**: PostGIS-powered geographic clustering and filtering
- **Role-based Access**: Different permissions for citizens, analysts, and admins
- **Offline Support**: API designed for offline queue synchronization
- **Analytics Dashboard**: Comprehensive statistics and trend analysis

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get profile | Yes |
| POST | `/api/reports` | Submit report | Yes |
| GET | `/api/reports` | List reports | No |
| GET | `/api/reports/hotspots` | Get clusters | No |
| PATCH | `/api/reports/:id/verify` | Verify report | Analyst+ |
| GET | `/api/social/trends` | Social trends | No |
| GET | `/api/dashboard/stats` | Dashboard stats | Analyst+ |
| GET | `/api/dashboard/export/reports` | Export data | Admin |

## 🌐 Real-time Events

| Event | Description | Recipients |
|-------|-------------|------------|
| `new_report` | New hazard report submitted | All authenticated users |
| `report_verified` | Report verification update | All authenticated users |
| `dashboard_update` | Statistics update | Analysts and admins |

## 🔄 Next Steps

1. **Frontend Integration**: Connect your React/mobile app to these APIs
2. **Production Deployment**: Follow DEPLOYMENT.md for cloud deployment
3. **Phase 2 Features**: Add real social media integration and NLP
4. **Mobile App**: Build React Native app using the WebSocket real-time features
5. **Analytics**: Enhance dashboard with charts and visualizations

## 📖 Documentation

- `README.md` - Complete API documentation
- `API_EXAMPLES.md` - Practical usage examples
- `NEON_SETUP.md` - Detailed Neon database setup
- `DEPLOYMENT.md` - Production deployment guide

## 🆘 Need Help?

- Check the health endpoint: `GET /api/health`
- Review logs for error details
- Verify environment variables are set correctly
- Ensure Neon database is accessible
- Check that PostGIS extension is enabled

Your INCOIS Hazard Reporting backend is ready! 🌊⚡