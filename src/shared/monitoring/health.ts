import { testConnection } from '@database/database.js';
import { connection as redisConnection } from '@shared/messaging/queue.js';
import { logger } from '@shared/logger.js';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    memory: MemoryHealth;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

export interface MemoryHealth {
  status: 'healthy' | 'degraded';
  usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  percentage: number;
}

export async function checkHealth(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  const [database, redis, memory] = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkMemory()
  ]);

  const services = {
    database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy' as const, error: database.reason?.message },
    redis: redis.status === 'fulfilled' ? redis.value : { status: 'unhealthy' as const, error: redis.reason?.message },
    memory: memory.status === 'fulfilled' ? memory.value : { status: 'degraded' as const, usage: process.memoryUsage(), percentage: 0 }
  };

  const overallStatus = determineOverallStatus(services);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services
  };
}

async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    await testConnection();
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    await redisConnection.ping();
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function checkMemory(): MemoryHealth {
  const usage = process.memoryUsage();
  const totalMemory = usage.rss + usage.heapTotal + usage.external;
  const percentage = Math.round((totalMemory / (1024 * 1024 * 1024)) * 100); // Convert to GB percentage
  
  return {
    status: percentage > 80 ? 'degraded' : 'healthy',
    usage,
    percentage
  };
}

function determineOverallStatus(services: HealthStatus['services']): HealthStatus['status'] {
  const { database, redis, memory } = services;
  
  if (database.status === 'unhealthy' || redis.status === 'unhealthy') {
    return 'unhealthy';
  }
  
  if (memory.status === 'degraded') {
    return 'degraded';
  }
  
  return 'healthy';
}

// Simple liveness check (for Kubernetes)
export function checkLiveness(): { status: 'ok'; timestamp: string } {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
}

// Readiness check (for Kubernetes)
export async function checkReadiness(): Promise<{ status: 'ready' | 'not_ready'; services: string[] }> {
  const health = await checkHealth();
  const readyServices: string[] = [];
  const notReadyServices: string[] = [];

  if (health.services.database.status === 'healthy') {
    readyServices.push('database');
  } else {
    notReadyServices.push('database');
  }

  if (health.services.redis.status === 'healthy') {
    readyServices.push('redis');
  } else {
    notReadyServices.push('redis');
  }

  return {
    status: notReadyServices.length === 0 ? 'ready' : 'not_ready',
    services: notReadyServices.length === 0 ? readyServices : notReadyServices
  };
}