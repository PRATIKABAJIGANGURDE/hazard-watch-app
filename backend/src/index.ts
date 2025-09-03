import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import pool from './config/database.js';
import routes from './routes/index.js';
import { SocketService } from './services/socketService.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(httpServer);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.resolve(config.uploadDir)));

// API routes
app.use('/api', routes);

// Health check for the root path
app.get('/', (req, res) => {
  res.json({
    message: 'INCOIS Hazard Reporting API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      social: '/api/social',
      dashboard: '/api/dashboard'
    },
    documentation: 'See README.md for API documentation'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  });
});

// Database connection test
const testDatabaseConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await testDatabaseConnection();
    
    httpServer.listen(config.port, () => {
      console.log(`🚀 INCOIS Hazard Reporting API running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
      console.log(`📊 Dashboard: http://localhost:${config.port}/api/dashboard/stats`);
      console.log(`🔌 WebSocket: ws://localhost:${config.port}`);
      
      if (config.nodeEnv === 'development') {
        console.log('\n📚 API Endpoints:');
        console.log('  POST /api/auth/register - Register new user');
        console.log('  POST /api/auth/login - User login');
        console.log('  GET  /api/auth/profile - Get user profile');
        console.log('  POST /api/reports - Submit hazard report');
        console.log('  GET  /api/reports - List all reports');
        console.log('  GET  /api/reports/hotspots - Get report clusters');
        console.log('  GET  /api/social/trends - Get social media trends');
        console.log('  GET  /api/dashboard/stats - Dashboard statistics');
        console.log('  GET  /api/health - Health check');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

// Export socket service for use in other modules
export { socketService };

// Start the server
startServer();