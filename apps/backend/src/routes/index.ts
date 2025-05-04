import { Router } from 'express';
import { logService } from '../services/logService';
import { Routes } from '@interfaces/routes.interface';
import HealthRoute from './health.route';
import { logger } from '@utils/logger';

// Create a router for logs
class LogRoute {
  public path = '/api/logs';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all logs
    this.router.get('/', (req, res) => {
      try {
        const logs = logService.getLogs();
        res.json(logs);
      } catch (error) {
        logger.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
      }
    });

    // Get logs by date
    this.router.get('/date/:date', (req, res) => {
      try {
        const logs = logService.getLogsByDate(req.params.date);
        res.json(logs);
      } catch (error) {
        logger.error('Error fetching logs by date:', error);
        res.status(500).json({ error: 'Failed to fetch logs by date' });
      }
    });

    // Search logs
    this.router.get('/search', (req, res) => {
      try {
        const query = req.query.q as string;
        if (!query) {
          return res.status(400).json({ error: 'Search query is required' });
        }
        const logs = logService.searchLogs(query);
        res.json(logs);
      } catch (error) {
        logger.error('Error searching logs:', error);
        res.status(500).json({ error: 'Failed to search logs' });
      }
    });
  }
}

const appRoutes: Routes[] = [
  new HealthRoute(),
  new LogRoute(),
  // ... other routes
];

export default appRoutes; 