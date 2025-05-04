import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, MAX_FILE_SIZE } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import bodyParser from 'body-parser';
import { logService } from './services/logService';
import { ContractsService } from './services/contracts.service';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private contractsService: ContractsService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.contractsService = new ContractsService();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeV1Routes();
    this.initializeErrorHandling();
    this.initializeStaticFiles();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    
    // CORS - Konfigurasi yang mengizinkan permintaan dari frontend dan aplikasi mobile
    this.app.use(cors({
      origin: [
        'https://localhost:8082', 'http://localhost:8082', 'http://localhost:3000',
        'http://reuse-eight.vercel.app', 'https://reuse-eight.vercel.app',
        'http://reuse-nine.vercel.app', 'https://reuse-nine.vercel.app',
        'http://reuse8.vercel.app', 'https://reuse8.vercel.app',
        'https://reuse.vet', 'http://reuse.vet',
        'https://reuse1202front.vercel.app', 'http://reuse1202front.vercel.app',
        'https://reuse1202back.vercel.app', 'http://reuse1202back.vercel.app',
        'veworld:', // URI scheme untuk aplikasi VeWorld
        '*' // Tambahkan wildcard untuk memudahkan pengujian
      ],
      credentials: CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Disposition'],
      maxAge: 86400, // 24 jam dalam detik
      preflightContinue: false
    }));
    
    // Untuk memastikan Vercel dapat melayani API dengan benar
    this.app.use((req, res, next) => {
      // Special handling for health check endpoint
      if (req.path === '/health' || req.path === '/api/health') {
        logger.info(`Health check request received: ${req.method} ${req.path}`);
        res.setHeader('Content-Type', 'application/json');
      }
      
      // Force content type for API routes when Accept header includes application/json
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.setHeader('Content-Type', 'application/json');
      }
      
      // Add special handling for Vercel serverless environment
      if (process.env.VERCEL) {
        logger.info(`[Vercel] ${req.method} ${req.url}`);
      }
      
      next();
    });
    
    // Log semua request untuk membantu debugging
    this.app.use((req, res, next) => {
      logger.info(`[${req.method}] ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
      next();
    });
    
    // Konfigurasi Helmet yang tidak membatasi CORS
    this.app.use(helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false
    }));
    
    this.app.use(compression());
    this.app.use(express.json({ limit: MAX_FILE_SIZE }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    // Add logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        logService.logRequest(req, res, responseTime);
      });
      next();
    });
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      // Log the registered routes
      logger.info(`Route registered: ${route.path}`);
      this.app.use(route.path, route.router);
      
      // Also explicitly register health check routes to ensure they're accessible
      if (route.path === '/health') {
        logger.info(`Registering health check route directly`);
        
        // Handle health check routes directly
        this.app.get('/health', (req, res, next) => {
          // Manually forward to the health route
          req.url = '/';
          route.router(req, res, next);
        });
        
        this.app.get('/api/health', (req, res, next) => {
          // Manually forward to the health route
          req.url = '/';
          route.router(req, res, next);
        });
      }
      
      // Juga daftarkan rute dengan prefix /api untuk kompatibilitas
      logger.info(`API Route registered: /api${route.path}`);
      this.app.use(`/api${route.path}`, route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Reuse Backend API Documentation',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  /**
   * Initiate versioned API routes
   * Prefix for versioned endpoints is `/api/v1`
   */
  private initializeV1Routes() {
    // Direct blockchain API endpoint
    this.app.get('/api/v1/remaining/:address', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const { address } = req.params;
        
        if (!address || address.trim() === '') {
          return res.status(400).json({
            message: 'Invalid address parameter'
          });
        }
        
        logger.info(`V1 API: Fetching remaining submissions for address: ${address}`);
        const result = await this.contractsService.getRemainingSubmissions(address);
        
        return res.status(200).json(result);
      } catch (error) {
        logger.error(`V1 API Error: ${error.message}`);
        next(error);
      }
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private initializeStaticFiles() {
    // Serve static files from the public directory
    const publicPath = path.join(__dirname, '../public');
    this.app.use(express.static(publicPath));
    
    // Add explicit handler for root path
    this.app.get('/', (req, res) => {
      logger.info('Root path requested, serving index.html');
      res.sendFile(path.join(publicPath, 'index.html'));
    });
    
    // Middleware untuk memeriksa jenis permintaan (API atau halaman web)
    this.app.use('*', (req, res, next) => {
      // Jika sudah ada header yang dikirim, jangan proses lebih lanjut
      if (res.headersSent) {
        return next();
      }

      // Improved detection of API requests
      const isApiRequest = 
        req.path.startsWith('/api/') || 
        req.path === '/submitReceipt' ||
        req.path.includes('/remaining/') ||
        req.path === '/health' ||
        req.headers.accept?.includes('application/json') ||
        // Add additional API path checks here
        req.path === '/api-docs' ||
        req.headers['x-requested-with'] === 'XMLHttpRequest';
      
      // For Vercel serverless functions, always set JSON content-type for API requests
      if (isApiRequest) {
        // Explicitly set JSON content type
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        // For API endpoints that weren't found, return a proper JSON 404
        if (!res.headersSent) {
          logger.info(`Returning JSON 404 for API path: ${req.originalUrl}`);
          return res.status(404).json({
            status: 'error',
            message: 'API endpoint not found',
            path: req.originalUrl
          });
        }
      } else {
        // For non-API requests (browser), send the index page
        if (!res.headersSent) {
          logger.info(`Serving HTML for non-API path: ${req.originalUrl}`);
          return res.sendFile(path.join(publicPath, 'index.html'));
        }
      }
      
      next();
    });
  }
}