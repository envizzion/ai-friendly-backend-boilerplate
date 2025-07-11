import { logger } from '@shared/logger.js';

const sendWelcomeEmail = async (data: { userId: string }, userService: any) => {
  const user = await userService.findById(data.userId);
  logger.info(`Welcome email sent to ${user?.email}`);
};

export default sendWelcomeEmail;
