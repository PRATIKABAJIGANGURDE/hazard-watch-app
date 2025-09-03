# INCOIS Hazard Reporting - Production Deployment Guide

This guide covers deploying the INCOIS Hazard Reporting backend to production using Neon as the database.

## 🚀 Deployment Options

### Option 1: Railway (Recommended for MVP)

Railway provides easy deployment with automatic SSL and environment management.

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set DATABASE_URL="your-neon-connection-string"
   railway variables set JWT_SECRET="your-super-secret-key"
   railway variables set NODE_ENV="production"
   railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Option 2: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

### Option 3: Docker + Cloud Platform

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY dist ./dist
   COPY uploads ./uploads

   EXPOSE 3001

   CMD ["npm", "start"]
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   docker build -t incois-hazard-backend .
   docker run -p 3001:3001 --env-file .env incois-hazard-backend
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Production Database (Neon)
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require

# Security
JWT_SECRET=your-256-bit-secret-key-here
NODE_ENV=production

# Server
PORT=3001

# CORS (your frontend domain)
CORS_ORIGIN=https://your-hazard-app.com

# File Upload (consider cloud storage in production)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Rate Limiting (stricter in production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Socket.IO
SOCKET_CORS_ORIGIN=https://your-hazard-app.com
```

### Security Checklist

- [ ] Strong JWT secret (256-bit minimum)
- [ ] HTTPS enabled (handled by platform)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] Database connection uses SSL
- [ ] File upload limits enforced
- [ ] Input validation on all endpoints

## 📁 File Storage in Production

### Option 1: AWS S3

```bash
npm install aws-sdk
```

Update upload middleware:
```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload to S3 instead of local storage
```

### Option 2: Cloudinary

```bash
npm install cloudinary
```

### Option 3: Supabase Storage

```bash
npm install @supabase/supabase-js
```

## 🗄️ Database Production Setup

### Neon Production Configuration

1. **Create Production Database**:
   - Create a new Neon project for production
   - Enable PostGIS extension
   - Set up connection pooling

2. **Run Production Migrations**:
   ```bash
   DATABASE_URL="your-prod-neon-url" npm run migrate
   ```

3. **Performance Optimization**:
   ```sql
   -- Add additional indexes for production workload
   CREATE INDEX CONCURRENTLY idx_reports_location_event 
   ON reports(event_type, timestamp) 
   WHERE ST_X(geom) BETWEEN 68 AND 97 AND ST_Y(geom) BETWEEN 6 AND 37;
   
   -- Analyze tables for query optimization
   ANALYZE users;
   ANALYZE reports;
   ANALYZE social_posts;
   ```

## 🔍 Monitoring and Logging

### Application Monitoring

1. **Health Checks**:
   ```bash
   # Set up automated health checks
   curl -f https://your-api-domain.com/api/health || exit 1
   ```

2. **Database Monitoring**:
   - Monitor connection pool usage
   - Track slow queries
   - Set up alerts for connection failures

3. **Error Tracking**:
   ```bash
   npm install @sentry/node
   ```

### Logging Configuration

```javascript
// Production logging setup
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'incois-hazard-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Railway
      run: railway deploy
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📊 Performance Optimization

### Database Optimization

1. **Connection Pooling**:
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 30, // Increase for production
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 5000,
   });
   ```

2. **Query Optimization**:
   ```sql
   -- Use EXPLAIN ANALYZE for slow queries
   EXPLAIN ANALYZE SELECT * FROM reports 
   WHERE ST_DWithin(geom, ST_MakePoint(80.27, 13.08), 50000);
   ```

### API Optimization

1. **Caching**:
   ```bash
   npm install redis
   ```

2. **Compression**:
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

## 🛡️ Security Hardening

### Production Security Measures

1. **Environment Variables**:
   - Never commit .env files
   - Use strong, unique secrets
   - Rotate JWT secrets periodically

2. **Database Security**:
   - Use connection string with SSL
   - Implement row-level security
   - Regular security updates

3. **API Security**:
   ```javascript
   // Additional security middleware
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
   }));
   ```

## 🚨 Disaster Recovery

### Backup Strategy

1. **Database Backups**:
   - Neon provides automatic backups
   - Implement additional export scripts
   - Test restore procedures

2. **Application Backups**:
   - Code in version control
   - Environment configuration documented
   - Media files backed up to cloud storage

### Incident Response

1. **Monitoring Alerts**:
   - Database connection failures
   - High error rates
   - Performance degradation

2. **Rollback Procedures**:
   - Keep previous deployment artifacts
   - Database migration rollback scripts
   - Quick deployment procedures

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**:
   - Multiple API instances
   - Database connection pooling
   - Session-less design (JWT)

2. **Microservices Split**:
   - Auth service
   - Report service
   - Analytics service
   - Media processing service

### Database Scaling

1. **Read Replicas**:
   - Neon supports read replicas
   - Route read queries to replicas

2. **Caching Layer**:
   - Redis for frequently accessed data
   - Cache invalidation strategies

## 🔧 Maintenance

### Regular Tasks

1. **Database Maintenance**:
   ```sql
   -- Run weekly
   VACUUM ANALYZE reports;
   REINDEX INDEX idx_reports_geom;
   ```

2. **Log Rotation**:
   - Set up log rotation
   - Monitor disk space
   - Archive old logs

3. **Security Updates**:
   ```bash
   # Regular dependency updates
   npm audit
   npm update
   ```

## 📞 Support and Monitoring

### Health Monitoring

1. **Uptime Monitoring**:
   - Set up external monitoring (Pingdom, UptimeRobot)
   - Monitor critical endpoints

2. **Performance Monitoring**:
   - Response time tracking
   - Database query performance
   - Memory and CPU usage

### Support Procedures

1. **Incident Response**:
   - Clear escalation procedures
   - Emergency contact information
   - System status page

2. **User Support**:
   - API documentation
   - Error code reference
   - Support ticket system

Your INCOIS Hazard Reporting backend is now ready for production deployment! 🌊