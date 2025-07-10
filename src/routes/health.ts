import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { checkHealth, checkLiveness, checkReadiness } from '@shared/monitoring/health.js';

const healthRoutes = new OpenAPIHono();

// Health check response schemas
const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string(),
  uptime: z.number(),
  services: z.object({
    database: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      responseTime: z.number().optional(),
      error: z.string().optional()
    }),
    redis: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      responseTime: z.number().optional(),
      error: z.string().optional()
    }),
    memory: z.object({
      status: z.enum(['healthy', 'degraded']),
      usage: z.object({
        rss: z.number(),
        heapTotal: z.number(),
        heapUsed: z.number(),
        external: z.number()
      }),
      percentage: z.number()
    })
  })
});

const LivenessSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string()
});

const ReadinessSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  services: z.array(z.string())
});

// Health check route
const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Get application health status',
  description: 'Returns detailed health information for all services',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthStatusSchema
        }
      },
      description: 'Health status retrieved successfully'
    },
    503: {
      content: {
        'application/json': {
          schema: HealthStatusSchema
        }
      },
      description: 'Service unavailable'
    }
  }
});

// Liveness probe route (for Kubernetes)
const livenessRoute = createRoute({
  method: 'get',
  path: '/health/live',
  tags: ['Health'],
  summary: 'Liveness probe',
  description: 'Simple liveness check for Kubernetes',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LivenessSchema
        }
      },
      description: 'Application is alive'
    }
  }
});

// Readiness probe route (for Kubernetes)
const readinessRoute = createRoute({
  method: 'get',
  path: '/health/ready',
  tags: ['Health'],
  summary: 'Readiness probe',
  description: 'Readiness check for Kubernetes',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ReadinessSchema
        }
      },
      description: 'Application is ready'
    },
    503: {
      content: {
        'application/json': {
          schema: ReadinessSchema
        }
      },
      description: 'Application is not ready'
    }
  }
});

// Route handlers
healthRoutes.openapi(healthRoute, async (c) => {
  try {
    const health = await checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    return c.json(health, statusCode);
  } catch (error) {
    return c.json({
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: 'unhealthy' as const, error: 'Health check failed' },
        redis: { status: 'unhealthy' as const, error: 'Health check failed' },
        memory: { status: 'degraded' as const, usage: process.memoryUsage(), percentage: 0 }
      }
    }, 503);
  }
});

healthRoutes.openapi(livenessRoute, (c) => {
  const result = checkLiveness();
  return c.json(result);
});

healthRoutes.openapi(readinessRoute, async (c) => {
  try {
    const readiness = await checkReadiness();
    const statusCode = readiness.status === 'ready' ? 200 : 503;
    return c.json(readiness, statusCode);
  } catch (error) {
    return c.json({
      status: 'not_ready' as const,
      services: ['health-check-failed']
    }, 503);
  }
});

export { healthRoutes };