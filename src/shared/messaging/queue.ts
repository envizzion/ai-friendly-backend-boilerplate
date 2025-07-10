import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import env from '@shared/env.js';
import { logger } from '@shared/logger.js';

// Redis connection for BullMQ
export const connection = new IORedis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
});

// Connection event handlers
connection.on('connect', () => {
  logger.info('Connected to Redis for queue processing');
});

connection.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

connection.on('close', () => {
  logger.info('Redis connection closed');
});

// Queue for async tasks
export const taskQueue = new Queue('task-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Task processor interface
export interface TaskProcessor<T = any> {
  process(job: Job<T>): Promise<void>;
}

// Task registry
const processors = new Map<string, TaskProcessor>();

export function registerTaskProcessor(taskName: string, processor: TaskProcessor) {
  processors.set(taskName, processor);
  logger.info(`Registered task processor: ${taskName}`);
}

// Worker instance
let worker: Worker | null = null;

export function startWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    'task-queue',
    async (job: Job) => {
      const processor = processors.get(job.name);
      if (!processor) {
        throw new Error(`No processor found for task: ${job.name}`);
      }

      logger.info(`Processing job: ${job.name} (${job.id})`);
      await processor.process(job);
      logger.info(`Completed job: ${job.name} (${job.id})`);
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job completed: ${job.name} (${job.id})`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job failed: ${job?.name} (${job?.id})`, err);
  });

  worker.on('error', (error) => {
    logger.error('Worker error:', error);
  });

  logger.info('Task queue worker started');
  return worker;
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Task queue worker stopped');
  }
}

export async function addTask<T = any>(taskName: string, data: T, options?: any): Promise<Job<T>> {
  return taskQueue.add(taskName, data, options);
}

// Graceful shutdown
export async function closeQueue(): Promise<void> {
  try {
    await stopWorker();
    await taskQueue.close();
    await connection.quit();
    logger.info('Queue system shut down successfully');
  } catch (error) {
    logger.error('Error shutting down queue system:', error);
    throw error;
  }
}