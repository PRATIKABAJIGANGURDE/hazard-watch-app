import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { config } from '../config/index.js';
import { CreateUserData, LoginData, JWTPayload } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserData = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Create new user
      const user = await UserModel.create(userData);

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(payload, config.jwtSecret, { 
        expiresIn: config.jwtExpiresIn 
      } as jwt.SignOptions);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginData = req.body;

      // Find user with password hash
      const user = await UserModel.findByEmailWithPassword(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(payload, config.jwtSecret, { 
        expiresIn: config.jwtExpiresIn 
      } as jwt.SignOptions);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // User is attached by authenticateToken middleware
      const user = (req as any).user;
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      // Generate new JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(payload, config.jwtSecret, { 
        expiresIn: config.jwtExpiresIn 
      } as jwt.SignOptions);

      res.json({
        message: 'Token refreshed successfully',
        token
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}