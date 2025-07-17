import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  // Server configuration
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.string().default('info'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  SECRET_KEY: z.string(),

  // Database configuration
  DB_HOST: z.string().default('localhost'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // Redis configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // File storage configuration
  CDN_URL_EXPIRY_HOURS: z.string().default('24'), // CDN URL expiration time in hours
  GCS_BUCKET_NAME: z.string(), // Google Cloud Storage bucket name

  // AWS configuration (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(), // AWS access key ID
  AWS_SECRET_ACCESS_KEY: z.string().optional(), // AWS secret access key
  AWS_REGION: z.string().optional(), // AWS region (default: us-east-1)

  // GCP configuration (optional, will use GOOGLE_* environment variables if not provided)
  GCP_PROJECT_ID: z.string().optional(), // Google Cloud project ID
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(), // Path to GCP service account JSON file

  // Mistral AI configuration
  MISTRAL_API_KEY: z.string().optional(), // Mistral AI API key

});

export default envSchema.parse(process.env);
