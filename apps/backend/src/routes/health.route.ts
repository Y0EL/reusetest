import { Router } from 'express';
import { logger } from '@utils/logger';
import { NODE_ENV } from '@config';
import os from 'os';
import { Routes } from '@interfaces/routes.interface';

class HealthRoute implements Routes {
  public path = '/health';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/`, this.getHealthStatus);
    
    // Tambahkan route duplikat untuk menjamin respons
    this.router.get(`/health`, this.getHealthStatus);
    
    // Tambahkan route untuk api/health yang mungkin dipanggil
    this.router.get(`/api/health`, this.getHealthStatus);
  }

  private getHealthStatus = async (req, res, next) => {
    try {
      logger.info(`Health check called from: ${req.ip}, UserAgent: ${req.get('user-agent')}`);
      
      // Set header yang eksplisit
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-API-Route', 'true');
      
      return res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  private getEnvironmentInfo() {
    return {
      nodeEnv: NODE_ENV,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      }
    };
  }
}

export default HealthRoute; 