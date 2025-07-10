import type { Job } from 'bullmq';
import { logger } from '@shared/logger.js';
import type { TaskProcessor } from '../queue.js';

export interface WelcomeEmailData {
  userId: string;
  email: string;
  name: string;
}

export class WelcomeEmailTask implements TaskProcessor<WelcomeEmailData> {
  async process(job: Job<WelcomeEmailData>): Promise<void> {
    const { userId, email, name } = job.data;
    
    try {
      // Simulate email sending
      logger.info(`Sending welcome email to ${email} for user ${userId}`);
      
      // Add actual email sending logic here
      // await emailService.sendWelcomeEmail({ email, name });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }
}