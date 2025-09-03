import pool from '../config/database.js';
import { User, CreateUserData } from '../types/index.js';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { name, email, password, role = 'citizen' } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    
    const result = await pool.query(query, [name, email, password_hash, role]);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByEmailWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    const query = `
      SELECT id, name, email, password_hash, role, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateRole(id: string, role: 'citizen' | 'analyst' | 'admin'): Promise<User | null> {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, created_at, updated_at
    `;
    
    const result = await pool.query(query, [role, id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}