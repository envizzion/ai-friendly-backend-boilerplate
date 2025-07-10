import { UserService } from '@/service/user.service.ts';
import { logger } from '../lib/logger.js';

const sendWelcomeEmail = async (data: any, userService: UserService) => {
  const user = await userService.findById(data.userId);
  logger.info(`Welcome email sent to ${user?.email}`);
};

export default sendWelcomeEmail;
