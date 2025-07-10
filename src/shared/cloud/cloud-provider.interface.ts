/**
 * Base interface for cloud provider credentials
 */
export type CloudCredentials = Record<string, any>;

/**
 * Base interface for cloud provider configurations
 */
export interface CloudProviderConfig {
    [key: string]: any;
}

/**
 * Base interface for cloud providers
 */
export interface CloudProvider {
    /**
     * Initialize the cloud provider with credentials
     * @param config - Optional provider configuration
     */
    initialize(config?: CloudProviderConfig): Promise<void>;

    /**
     * Get the provider name
     * @returns Provider name
     */
    getProviderName(): string;

    /**
     * Check if provider is initialized
     * @returns Initialization status
     */
    isInitialized(): boolean;
}

/**
 * Singleton registry for cloud providers
 */
export class CloudProviderRegistry {
    private static instance: CloudProviderRegistry;
    private providers: Map<string, CloudProvider> = new Map();

    private constructor() { }

    public static getInstance(): CloudProviderRegistry {
        if (!CloudProviderRegistry.instance) {
            CloudProviderRegistry.instance = new CloudProviderRegistry();
        }
        return CloudProviderRegistry.instance;
    }

    public registerProvider(name: string, provider: CloudProvider): void {
        this.providers.set(name, provider);
    }

    public getProvider<T extends CloudProvider>(name: string): T {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new Error(`Cloud provider '${name}' not registered`);
        }
        return provider as T;
    }

    public hasProvider(name: string): boolean {
        return this.providers.has(name);
    }
}

/**
 * AWS specific configuration
 */
export interface AWSConfig extends CloudProviderConfig {
    region?: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
        region?: string;
    };
}

/**
 * GCP specific configuration
 */
export interface GCPConfig extends CloudProviderConfig {
    projectId?: string;
    credentials?: any;
} 