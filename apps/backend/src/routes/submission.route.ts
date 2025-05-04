import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { SubmissionController } from '@controllers/submission.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { body } from 'express-validator';
import * as console from 'node:console';
import { SubmitDto } from '@/dtos/submission.dto';

export class SubmissionRoute implements Routes {
  public path = '/submitReceipt';
  public router = Router();
  public submission = new SubmissionController();
  
  // Cache sederhana untuk getRemainingSubmissions
  private submissionCache = new Map<string, {
    data: { remaining: number; max: number; },
    timestamp: number;
  }>();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', ValidationMiddleware(SubmitDto), this.submission.submitReceipt);
    this.router.get('/remaining/:address', this.getCachedRemainingSubmissions);
  }
  
  // Metode dengan cache untuk mengurangi queries ke blockchain
  private getCachedRemainingSubmissions = async (req, res, next) => {
    try {
      const { address } = req.params;
      
      if (!address) {
        return res.status(400).json({ message: 'Wallet address is required' });
      }

      // Periksa cache, valid selama 5 menit
      const cacheEntry = this.submissionCache.get(address);
      const now = Date.now();
      const cacheMaxAge = 5 * 60 * 1000; // 5 menit
      
      if (cacheEntry && (now - cacheEntry.timestamp < cacheMaxAge)) {
        console.log(`Using cached data for ${address}, age: ${Math.round((now - cacheEntry.timestamp)/1000)}s`);
        return res.status(200).json(cacheEntry.data);
      }
      
      // Cache miss, ambil dari blockchain
      const submissions = await this.submission.contracts.getRemainingSubmissions(address);
      
      // Save to cache
      this.submissionCache.set(address, {
        data: submissions,
        timestamp: now
      });
      
      res.status(200).json(submissions);
    } catch (error) {
      next(error);
      return;
    }
  };
}