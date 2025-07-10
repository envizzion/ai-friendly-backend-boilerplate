import env from '@/lib/env.js';
import { logger } from '@/lib/logger.js';
import { AWSConfig, CloudProvider } from './cloud-provider.interface.js';

export interface AWSCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

export class AWSCloudProvider implements CloudProvider {
    protected credentials: AWSCredentials | null = null;
    protected initialized = false;
    private static instance: AWSCloudProvider;

    private constructor() {
        this.initialized = false;
    }

    /**
     * Get the singleton instance
     * @returns AWSCloudProvider instance
     */
    public static getInstance(): AWSCloudProvider {
        if (!AWSCloudProvider.instance) {
            AWSCloudProvider.instance = new AWSCloudProvider();
        }
        return AWSCloudProvider.instance;
    }

    public async initialize(config?: AWSConfig): Promise<void> {
        if (this.initialized) return;

        try {
            // Load credentials from environment variables first
            // We still need to use process.env for these specific variables
            // as they are standard AWS environment variables not in our env schema
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
            const region = process.env.AWS_REGION || (config?.region ?? env.AWS_REGION ?? 'us-east-1');

            // If environment variables are not set, try to load from config
            if (!accessKeyId || !secretAccessKey) {
                if (!config?.credentials) {
                    throw new Error('AWS credentials not found in environment variables or config');
                }

                const { credentials } = config;
                if (!credentials.accessKeyId || !credentials.secretAccessKey) {
                    throw new Error('Invalid AWS credentials format');
                }

                this.credentials = {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    region: credentials.region || region
                };
            } else {
                this.credentials = {
                    accessKeyId,
                    secretAccessKey,
                    region
                };
            }

            this.initialized = true;
            logger.info(`AWS Cloud Provider initialized for region ${this.credentials.region}`);
        } catch (error) {
            logger.error('Failed to initialize AWS Cloud Provider:', error);
            throw error;
        }
    }

    public getProviderName(): string {
        return 'aws';
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    protected getCredentials(): AWSCredentials {
        if (!this.isInitialized() || !this.credentials) {
            throw new Error('AWS Cloud Provider not initialized');
        }
        return this.credentials;
    }
} 