import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

export class FileUtils {
  static async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(config.uploadDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static async deleteFiles(filenames: string[]): Promise<void> {
    await Promise.all(filenames.map(filename => this.deleteFile(filename)));
  }

  static getFileUrl(filename: string): string {
    return `/api/uploads/${filename}`;
  }

  static extractFilenameFromUrl(url: string): string {
    return path.basename(url);
  }

  static isValidImageType(mimetype: string): boolean {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validImageTypes.includes(mimetype);
  }

  static isValidVideoType(mimetype: string): boolean {
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    return validVideoTypes.includes(mimetype);
  }

  static isValidMediaType(mimetype: string): boolean {
    return this.isValidImageType(mimetype) || this.isValidVideoType(mimetype);
  }

  static getFileSize(filename: string): number {
    try {
      const filePath = path.join(config.uploadDir, filename);
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}