# INCOIS Hazard Reporting Backend

A robust backend API for the Indian National Centre for Ocean Information Services (INCOIS) Hazard Reporting System. This system enables crowdsourced hazard reporting with real-time updates, spatial data support, and role-based access control.

## 🚀 Features

- **Spatial Data Support**: PostGIS integration for geospatial queries and clustering
- **Real-time Updates**: WebSocket support for live report feeds
- **Role-based Access**: Citizen, Analyst, and Admin roles with appropriate permissions
- **Media Upload**: Support for photos and videos with hazard reports
- **Authentication**: JWT-based authentication with secure password hashing
- **API Rate Limiting**: Protection against abuse and DoS attacks
- **Social Media Integration**: Phase 1 mock data, Phase 2 ready for real integration
- **Analytics Dashboard**: Comprehensive statistics and hotspot analysis

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Neon PostgreSQL with PostGIS extension
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO for WebSocket connections
- **File Upload**: Multer for media handling
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, rate limiting

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Neon Database** account with PostgreSQL database
3. **PostGIS Extension** enabled in your Neon database

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your Neon database credentials:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 2. Neon Database Setup

1. Create a new Neon project at [neon.tech](https://neon.tech)
2. Create a database for your project
3. Enable PostGIS extension in your database:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Copy your connection string to the `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npm run migrate
```

Or manually run:
```bash
npx ts-node --esm src/database/migrate.ts
```

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `POST /api/auth/refresh` - Refresh JWT token (authenticated)

### Reports
- `POST /api/reports` - Submit hazard report (authenticated)
- `GET /api/reports` - List reports with filters
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/hotspots` - Get clustered hotspots
- `PATCH /api/reports/:id/verify` - Verify report (analyst/admin)
- `DELETE /api/reports/:id` - Delete report (owner/admin)
- `GET /api/reports/user/my-reports` - Get user's reports (authenticated)

### Social Media
- `GET /api/social/trends` - Get social media trends (Phase 1: mock data)
- `GET /api/social/posts` - Get social media posts
- `GET /api/social/posts/location` - Get posts by location

### Dashboard (Analyst/Admin only)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Detailed analytics
- `GET /api/dashboard/export/reports` - Export reports (Admin only)

### Utility
- `GET /api/health` - Health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

1. **Citizen**: Can submit and view reports
2. **Analyst**: Can verify reports and access analytics
3. **Admin**: Full access including user management and data export

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `password_hash` (Text)
- `role` (Enum: citizen, analyst, admin)
- `created_at`, `updated_at` (Timestamps)

### Reports Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `event_type` (Enum: high_wave, flood, tsunami, unusual_tide, other)
- `description` (Text)
- `geom` (PostGIS Point geometry)
- `location_name` (Text, Optional)
- `media_urls` (Text Array)
- `verified` (Boolean)
- `timestamp`, `created_at`, `updated_at` (Timestamps)

### Social Posts Table (Phase 2)
- `id` (UUID, Primary Key)
- `platform` (Text)
- `post_id` (Text)
- `text` (Text)
- `author` (Text)
- `geom` (PostGIS Point geometry, Optional)
- `sentiment` (Enum: positive, negative, neutral)
- `timestamp`, `created_at` (Timestamps)

## 🌐 Real-time Features

The API includes WebSocket support for real-time updates:

### Socket Events

**Client to Server:**
- `authenticate` - Authenticate with JWT token
- `subscribe_location` - Subscribe to reports in a geographic area
- `unsubscribe_location` - Unsubscribe from location updates

**Server to Client:**
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `new_report` - New report submitted
- `report_verified` - Report verification update
- `dashboard_update` - Dashboard statistics update

## 📁 File Upload

Media files (images and videos) can be uploaded with reports:

- **Supported formats**: JPEG, PNG, GIF, WebP, MP4, MPEG, QuickTime, WebM
- **Maximum file size**: 10MB per file
- **Maximum files**: 5 files per report
- **Storage**: Local filesystem (production should use cloud storage)

## 🔍 Spatial Queries

The API supports various spatial queries using PostGIS:

### Bounding Box Filter
```
GET /api/reports?bbox=minLon,minLat,maxLon,maxLat
```

### Hotspot Clustering
```
GET /api/reports/hotspots?clusters=5&days=30
```

## 🛡 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Parameterized queries
- **Password Hashing**: bcrypt with salt rounds

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [/* validation details if applicable */]
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔄 Development Workflow

1. **Start development server**: `npm run dev`
2. **Build for production**: `npm run build`
3. **Run migrations**: `npx ts-node --esm src/database/migrate.ts`
4. **Check health**: `curl http://localhost:3001/api/health`

## 📈 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set strong JWT secret
4. Configure proper CORS origins
5. Set up cloud storage for media files
6. Configure reverse proxy (nginx)
7. Set up SSL certificates

## 🔮 Phase 2 Roadmap

- **Social Media Integration**: Real Twitter/Facebook API integration
- **NLP Sentiment Analysis**: Python microservice for text classification
- **Advanced Clustering**: ML-based hotspot prediction
- **Push Notifications**: Mobile app notifications
- **Offline Sync**: Enhanced offline support
- **Data Visualization**: Advanced analytics and charts

## 📞 Support

For technical support or questions about the INCOIS Hazard Reporting System, please contact the development team.