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
import { api } from './routes/index.js';
import { coreApi } from './routes/core.routes.js';
import { vendorApi } from './routes/vendor.routes.js';
import { customerApi } from './routes/customer.routes.js';

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
        architecture: 'Feature-based with Domain-organized Schemas',
        domains: ['core', 'vendor', 'customer'],
        endpoints: {
          legacy: '/api/*',
          core: '/api/core/*',
          vendor: '/api/vendor/*',
          customer: '/api/customer/*',
          docs: {
            unified: '/doc',
            core: '/doc/core',
            vendor: '/doc/vendor',
            customer: '/doc/customer'
          }
        },
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

    // 🔄 COMPATIBILITY: Legacy API routes
    this.app.route('/api', api);

    // 🚀 NEW: Domain-specific API routes
    this.app.route('/api/core', coreApi);
    this.app.route('/api/vendor', vendorApi);
    this.app.route('/api/customer', customerApi);

    // 🚀 NEW: Domain-specific OpenAPI documentation
    this.setupDomainOpenAPIEndpoints();

    // 🔄 COMPATIBILITY: Unified OpenAPI documentation
    this.setupUnifiedOpenAPIEndpoint();

    // 404 handler
    this.app.notFound((c) => {
      return c.json({
        message: 'Not Found',
        path: c.req.path,
        method: c.req.method,
        availableEndpoints: {
          legacy: '/api/*',
          core: '/api/core/*',
          vendor: '/api/vendor/*',
          customer: '/api/customer/*'
        }
      }, 404);
    });
  }

  private setupDomainOpenAPIEndpoints() {
    // Core Domain OpenAPI
    const coreOpenAPIDocument = {
      openapi: '3.0.0',
      info: {
        title: 'Parts App - Core Domain API',
        version: '1.0.0',
        description: 'Core business domain operations: manufacturers, models, parts, colors, body styles'
      },
      servers: [
        {
          url: '/api/core',
          description: isDev ? 'Development - Core Domain' : 'Production - Core Domain'
        }
      ],
      tags: [
        { name: 'core', description: 'Core business domain operations' }
      ]
    };

    this.app.doc('/openapi/core.json', coreOpenAPIDocument);
    this.app.get('/doc/core', swaggerUI({ url: '/openapi/core.json' }));

    // Vendor Domain OpenAPI
    const vendorOpenAPIDocument = {
      openapi: '3.0.0',
      info: {
        title: 'Parts App - Vendor Domain API',
        version: '1.0.0',
        description: 'Vendor marketplace operations: inventory, listings, vendor management'
      },
      servers: [
        {
          url: '/api/vendor',
          description: isDev ? 'Development - Vendor Domain' : 'Production - Vendor Domain'
        }
      ],
      tags: [
        { name: 'vendor', description: 'Vendor marketplace operations' }
      ]
    };

    this.app.doc('/openapi/vendor.json', vendorOpenAPIDocument);
    this.app.get('/doc/vendor', swaggerUI({ url: '/openapi/vendor.json' }));

    // Customer Domain OpenAPI
    const customerOpenAPIDocument = {
      openapi: '3.0.0',
      info: {
        title: 'Parts App - Customer Domain API',
        version: '1.0.0',
        description: 'Customer shopping operations: cart, orders, search, preferences'
      },
      servers: [
        {
          url: '/api/customer',
          description: isDev ? 'Development - Customer Domain' : 'Production - Customer Domain'
        }
      ],
      tags: [
        { name: 'customer', description: 'Customer shopping operations' }
      ]
    };

    this.app.doc('/openapi/customer.json', customerOpenAPIDocument);
    this.app.get('/doc/customer', swaggerUI({ url: '/openapi/customer.json' }));
  }

  private setupUnifiedOpenAPIEndpoint() {
    // Unified OpenAPI documentation (for backward compatibility)
    const unifiedOpenAPIDocument = this.app.getOpenAPIDocument({
      openapi: '3.0.0',
      info: {
        title: 'Parts App API - Unified Documentation',
        version: '1.0.0',
        description: 'Vehicle Parts Catalog API with comprehensive functionality (Legacy endpoints + Domain-specific endpoints)'
      },
      servers: [
        {
          url: '',
          description: isDev ? 'Development server' : 'Production server'
        }
      ]
    });

    // Add security schemes
    if (!unifiedOpenAPIDocument.components) {
      unifiedOpenAPIDocument.components = {};
    }

    unifiedOpenAPIDocument.components.securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    };

    // Export OpenAPI specs in development
    if (isDev) {
      this.exportOpenAPISpecs(unifiedOpenAPIDocument);
    }

    // Serve unified OpenAPI documentation
    this.app.get('/openapi.json', (c) => {
      return c.json(unifiedOpenAPIDocument);
    });

    this.app.get('/doc', swaggerUI({ url: '/openapi.json' }));
  }

  private exportOpenAPISpecs(unifiedDocument: any) {
    try {
      const openApiDir = path.join(process.cwd(), 'openapi');
      if (!fs.existsSync(openApiDir)) {
        fs.mkdirSync(openApiDir, { recursive: true });
      }

      // Export unified spec
      const unifiedPath = path.join(openApiDir, 'openapi.json');
      fs.writeFileSync(unifiedPath, JSON.stringify(unifiedDocument, null, 2));
      logger.info(`Unified OpenAPI JSON exported to: ${unifiedPath}`);

      // Export domain-specific specs (for frontend type generation)
      const coreSpec = { /* Core domain spec */ };
      const vendorSpec = { /* Vendor domain spec */ };
      const customerSpec = { /* Customer domain spec */ };

      fs.writeFileSync(
        path.join(openApiDir, 'core.json'),
        JSON.stringify(coreSpec, null, 2)
      );
      fs.writeFileSync(
        path.join(openApiDir, 'vendor.json'),
        JSON.stringify(vendorSpec, null, 2)
      );
      fs.writeFileSync(
        path.join(openApiDir, 'customer.json'),
        JSON.stringify(customerSpec, null, 2)
      );

      logger.info('Domain-specific OpenAPI specs exported');
    } catch (error) {
      logger.error('Failed to export OpenAPI specs:', error);
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
      logger.info(`🎯 Core Domain API available at http://localhost:${port}/api/core`);
      logger.info(`🏪 Vendor Domain API available at http://localhost:${port}/api/vendor`);
      logger.info(`🛍️ Customer Domain API available at http://localhost:${port}/api/customer`);
      logger.info(`📚 Unified Docs available at http://localhost:${port}/doc`);
      logger.info(`📖 Core Docs available at http://localhost:${port}/doc/core`);
      logger.info(`📖 Vendor Docs available at http://localhost:${port}/doc/vendor`);
      logger.info(`📖 Customer Docs available at http://localhost:${port}/doc/customer`);

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