import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserModel } from '../models/User.js';
import { JWTPayload, User, Report } from '../types/index.js';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, { socket: Socket; user: User }> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.socketCorsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const decoded = jwt.verify(data.token, config.jwtSecret) as JWTPayload;
          const user = await UserModel.findById(decoded.userId);

          if (!user) {
            socket.emit('auth_error', { error: 'User not found' });
            return;
          }

          // Store authenticated user
          this.connectedUsers.set(socket.id, { socket, user });
          
          // Join user to appropriate rooms based on role
          socket.join('authenticated');
          socket.join(`role:${user.role}`);
          
          socket.emit('authenticated', { 
            user: { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              role: user.role 
            } 
          });

          console.log(`✅ User authenticated: ${user.email} (${user.role})`);
        } catch (error) {
          socket.emit('auth_error', { error: 'Invalid token' });
        }
      });

      // Handle location subscription for real-time updates
      socket.on('subscribe_location', (data: { bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number } }) => {
        const roomName = `location:${data.bbox.minLat},${data.bbox.minLon},${data.bbox.maxLat},${data.bbox.maxLon}`;
        socket.join(roomName);
        socket.emit('location_subscribed', { bbox: data.bbox });
      });

      // Handle unsubscribe from location
      socket.on('unsubscribe_location', (data: { bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number } }) => {
        const roomName = `location:${data.bbox.minLat},${data.bbox.minLon},${data.bbox.maxLat},${data.bbox.maxLon}`;
        socket.leave(roomName);
        socket.emit('location_unsubscribed', { bbox: data.bbox });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const userConnection = this.connectedUsers.get(socket.id);
        if (userConnection) {
          console.log(`🔌 User disconnected: ${userConnection.user.email}`);
          this.connectedUsers.delete(socket.id);
        }
      });
    });
  }

  // Method to broadcast new reports to relevant clients
  public broadcastNewReport(report: Report): void {
    // Broadcast to all authenticated users
    this.io.to('authenticated').emit('new_report', { report });

    // Broadcast to analysts and admins for verification queue
    this.io.to('role:analyst').emit('verification_queue_update', { 
      action: 'new_report',
      report 
    });
    this.io.to('role:admin').emit('verification_queue_update', { 
      action: 'new_report',
      report 
    });

    // Broadcast to location-specific subscribers
    // This would require implementing spatial room management
    console.log(`📡 Broadcasting new report: ${report.id} (${report.event_type})`);
  }

  // Method to broadcast report verification updates
  public broadcastReportVerification(report: Report): void {
    this.io.to('authenticated').emit('report_verified', { report });
    
    console.log(`✅ Broadcasting report verification: ${report.id}`);
  }

  // Method to broadcast dashboard updates to analysts/admins
  public broadcastDashboardUpdate(stats: any): void {
    this.io.to('role:analyst').emit('dashboard_update', { stats });
    this.io.to('role:admin').emit('dashboard_update', { stats });
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  public getConnectedUsersByRole(role: string): User[] {
    const users: User[] = [];
    this.connectedUsers.forEach(({ user }) => {
      if (user.role === role) {
        users.push(user);
      }
    });
    return users;
  }
}