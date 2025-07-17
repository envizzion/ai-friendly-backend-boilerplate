import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { logger as httpLogger } from 'hono/logger';
import { trimTrailingSlash } from 'hono/trailing-slash';
import fs from 'node:fs';
import path from 'node:path';

import { closeDatabase, testConnection } from '@database/database.js';
import env from '@shared/env.js';
import { logger } from '@shared/logger.js';
import { closeQueue, registerTaskProcessor, startWorker } from '@shared/messaging/queue.js';
import { WelcomeEmailTask } from '@shared/messaging/tasks/welcome-email.task.js';
import { CloudProviderFactory } from '@shared/cloud/index.js';
import { api } from './routes.js';

const isDev = env.NODE_ENV !== 'production';

class Server {
  private app: OpenAPIHono;
  private workerStarted = false;
  private cloudProviders: any = {};

  constructor() {
    this.app = new OpenAPIHono();
  }

  public async configure() {
    // Generic middlewares
    this.app.use(cors());
    this.app.use(compress());
    this.app.use(httpLogger());
    this.app.use(trimTrailingSlash());

    // Error handling middleware
    this.app.onError((err, c) => {
      logger.error({
        error: err.message,
        stack: err.stack,
        path: c.req.path,
        method: c.req.method,
      });
      return c.json({
        message: 'Internal server error',
        path: c.req.path,
        error: isDev ? err.message : 'Internal server error'
      }, 500);
    });

    // Index path
    this.app.get('/', (c) => {
      return c.json({
        message: 'Parts App API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    // Test error endpoint (development only)
    if (isDev) {
      this.app.get('/test-error', () => {
        const error = new Error('Test error from endpoint');
        error.stack = new Error().stack;
        throw error;
      });
    }

    // Static files
    this.app.use('/static/*', serveStatic({ root: './' }));

    // Initialize cloud providers
    await this.initializeCloudProviders();

    // Initialize background processing
    this.initializeWorker();

    // Register API routes
    this.app.route('/api', api);

    // Configure OpenAPI documentation
    const openAPIDocument = this.app.getOpenAPIDocument({
      openapi: '3.0.0',
      info: {
        title: 'Parts App API',
        version: '1.0.0',
        description: 'Vehicle Parts Catalog API with comprehensive functionality'
      },
      servers: [
        {
          url: '',
          description: isDev ? 'Development server' : 'Production server'
        }
      ]
    });

    // Add security schemes
    if (!openAPIDocument.components) {
      openAPIDocument.components = {};
    }

    openAPIDocument.components.securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    };

    // Export OpenAPI spec in development
    if (isDev) {
      this.exportOpenAPISpec(openAPIDocument);
    }

    // Serve OpenAPI documentation
    this.app.get('/openapi.json', (c) => {
      return c.json(openAPIDocument);
    });

    this.app.get('/doc', swaggerUI({ url: '/openapi.json' }));

    // 404 handler
    this.app.notFound((c) => {
      return c.json({
        message: 'Not Found',
        path: c.req.path,
        method: c.req.method
      }, 404);
    });
  }

  private exportOpenAPISpec(document: any) {
    try {
      const openApiDir = path.join(process.cwd(), 'openapi');
      if (!fs.existsSync(openApiDir)) {
        fs.mkdirSync(openApiDir, { recursive: true });
      }

      const jsonPath = path.join(openApiDir, 'openapi.json');
      fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
      logger.info(`OpenAPI JSON exported to: ${jsonPath}`);
    } catch (error) {
      logger.error('Failed to export OpenAPI spec:', error);
    }
  }

  private async initializeCloudProviders() {
    try {
      // Initialize based on available environment variables
      if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION) {
        this.cloudProviders.aws = await CloudProviderFactory.initializeAWS();
        logger.info('AWS cloud providers initialized');
      }

      if (env.GOOGLE_APPLICATION_CREDENTIALS && env.GCP_PROJECT_ID) {
        this.cloudProviders.gcp = await CloudProviderFactory.initializeGCP();
        logger.info('GCP cloud providers initialized');
      }

      if (Object.keys(this.cloudProviders).length === 0) {
        logger.warn('No cloud providers initialized - check environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, GOOGLE_APPLICATION_CREDENTIALS, GCP_PROJECT_ID)');
      } else {
        logger.info('Cloud providers initialization complete');
      }
    } catch (error) {
      logger.error('Failed to initialize cloud providers:', error);
      // Don't fail server startup, just log the error
    }
  }

  private initializeWorker() {
    if (this.workerStarted) {
      return;
    }

    try {
      // Register task processors
      registerTaskProcessor('welcome-email', new WelcomeEmailTask());

      // Start the worker
      startWorker();
      this.workerStarted = true;
      logger.info('Background worker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize background worker:', error);
    }
  }

  public getApp() {
    return this.app;
  }

  public getCloudProviders() {
    return this.cloudProviders;
  }

  public async start() {
    try {
      // Test database connection
      await testConnection();
      logger.info('Database connection established');

      // Configure server
      await this.configure();

      // Start server
      const port = Number.parseInt(env.PORT);
      const server = serve({
        fetch: this.app.fetch,
        port
      });

      logger.info(`🚀 Server running on port: ${port}`);
      logger.info(`📝 API available at http://localhost:${port}/api`);
      logger.info(`📚 Docs available at http://localhost:${port}/doc`);

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received');
        logger.info('Closing http server');

        server.close(async () => {
          logger.info('Closing queue system');
          await closeQueue();
          logger.info('Closing database connection');
          await closeDatabase();
          logger.info('Exiting...');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT signal received');
        logger.info('Closing http server');

        server.close(async () => {
          logger.info('Closing queue system');
          await closeQueue();
          logger.info('Closing database connection');
          await closeDatabase();
          logger.info('Exiting...');
          process.exit(0);
        });
      });

      return server;
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }
}

export default Server;