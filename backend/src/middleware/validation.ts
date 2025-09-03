import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('citizen', 'analyst', 'admin').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Report validation schemas
export const createReportSchema = Joi.object({
  event_type: Joi.string().valid('high_wave', 'flood', 'tsunami', 'unusual_tide', 'other').required(),
  description: Joi.string().min(10).max(2000).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  location_name: Joi.string().max(500).optional(),
  media_urls: Joi.array().items(Joi.string().uri()).optional()
});

export const queryFiltersSchema = Joi.object({
  bbox: Joi.object({
    minLat: Joi.number().min(-90).max(90).required(),
    maxLat: Joi.number().min(-90).max(90).required(),
    minLon: Joi.number().min(-180).max(180).required(),
    maxLon: Joi.number().min(-180).max(180).required()
  }).optional(),
  event_type: Joi.string().valid('high_wave', 'flood', 'tsunami', 'unusual_tide', 'other').optional(),
  verified: Joi.boolean().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  limit: Joi.number().min(1).max(100).optional(),
  offset: Joi.number().min(0).optional()
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      res.status(400).json({
        error: 'Query validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    req.query = value;
    next();
  };
};