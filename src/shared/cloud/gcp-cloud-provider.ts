import env from '@/lib/env.js';
import { logger } from '@/lib/logger.js';
import fs from 'fs';
import { CloudProvider, GCPConfig } from './cloud-provider.interface.js';

export interface GCPCredentials {
    projectId: string;
    credentials: {
        client_email: string;
        private_key: string;
        [key: string]: any;
    };
}

export class GCPCloudProvider implements CloudProvider {
    protected credentials: GCPCredentials | null = null;
    protected initialized = false;
    private static instance: GCPCloudProvider;

    private constructor() {
        this.initialized = false;
    }

    /**
     * Get the singleton instance
     * @returns GCPCloudProvider instance
     */
    public static getInstance(): GCPCloudProvider {
        if (!GCPCloudProvider.instance) {
            GCPCloudProvider.instance = new GCPCloudProvider();
        }
        return GCPCloudProvider.instance;
    }

    public async initialize(config?: GCPConfig): Promise<void> {
        if (this.initialized) return;

        try {
            // Use GOOGLE_APPLICATION_CREDENTIALS environment variable
            const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const projectId = config?.projectId || env.GCP_PROJECT_ID;

            if (!credentialsPath) {
                throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
            }

            // Load from credentials file
            if (!fs.existsSync(credentialsPath)) {
                throw new Error(`GCP credentials file not found at ${credentialsPath}`);
            }

            const fileContents = fs.readFileSync(credentialsPath, 'utf8');
            const parsedCredentials = JSON.parse(fileContents);
            this.credentials = this.parseCredentials(parsedCredentials, projectId);

            this.initialized = true;
            logger.info(`GCP Cloud Provider initialized for project ${this.credentials.projectId}`);
        } catch (error) {
            logger.error('Failed to initialize GCP Cloud Provider:', error);
            throw error;
        }
    }

    public getProviderName(): string {
        return 'gcp';
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    protected getCredentials(): GCPCredentials {
        if (!this.isInitialized() || !this.credentials) {
            throw new Error('GCP Cloud Provider not initialized');
        }
        return this.credentials;
    }

    private parseCredentials(rawCredentials: any, projectIdOverride?: string): GCPCredentials {
        if (!rawCredentials.project_id || !rawCredentials.client_email || !rawCredentials.private_key) {
            throw new Error('Invalid GCP credentials format');
        }

        return {
            projectId: projectIdOverride || rawCredentials.project_id,
            credentials: {
                client_email: rawCredentials.client_email,
                private_key: rawCredentials.private_key,
                ...rawCredentials
            }
        };
    }
} 