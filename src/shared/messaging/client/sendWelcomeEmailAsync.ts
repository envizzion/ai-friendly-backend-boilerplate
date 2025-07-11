import { logger } from '@shared/logger.js';
import { taskQueue } from '@shared/queue.js';
import { TASK } from '../tasker.js';

const sendWelcomeEmailAsync = async (userId: number) => {
  const job = await taskQueue.add(TASK.SendWelcomeEmail, { userId });
  logger.info(`Job ${job.id} added to queue. Task scheduled for ${TASK.SendWelcomeEmail}, user: ${userId}`);
};

export default sendWelcomeEmailAsync;
