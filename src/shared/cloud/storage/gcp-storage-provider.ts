import env from '@/lib/env.js';
import { logger } from '@/lib/logger.js';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import path from 'path';
import { GCPConfig } from '../cloud-provider.interface.js';
import { GCPCloudProvider, GCPCredentials } from '../gcp-cloud-provider.js';
import { FileUploadParams, FileUploadResult, StorageProvider } from './storage-provider.interface.js';

/**
 * Google Cloud Storage implementation of StorageProvider
 */
export class GcpStorageProvider implements StorageProvider {
    private storage: Storage | null = null;
    private bucketName: string;
    private initialized = false;
    private readonly baseProvider: GCPCloudProvider;

    /**
     * Constructor
     * @param baseProvider - Base GCP cloud provider
     * @param bucketName - Storage bucket name
     */
    constructor(baseProvider: GCPCloudProvider, bucketName: string = env.GCS_BUCKET_NAME) {
        this.baseProvider = baseProvider;
        this.bucketName = bucketName;
    }

    /**
     * Initialize the Google Cloud Storage client
     * @param config - Optional cloud provider configuration
     */
    public async initialize(config?: GCPConfig): Promise<void> {
        if (!this.baseProvider.isInitialized()) {
            throw new Error('Base GCP provider must be initialized before Storage provider');
        }

        try {
            const credentials = this.getCredentials();
            this.storage = new Storage({
                credentials: credentials.credentials,
                projectId: credentials.projectId
            });
            this.initialized = true;
            logger.info(`GCP Storage client initialized for project ${credentials.projectId}`);
        } catch (error) {
            logger.error('Failed to initialize GCP Storage provider:', error);
            throw new Error(`Failed to initialize GCP Storage provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getProviderName(): string {
        return 'gcp-storage';
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get credentials from the base provider
     */
    private getCredentials(): GCPCredentials {
        try {
            // Use protected method from base class via type assertion
            return (this.baseProvider as any).getCredentials();
        } catch (error) {
            throw new Error('Failed to get GCP credentials from base provider');
        }
    }

    /**
     * Upload file to Google Cloud Storage
     * @param params - File upload parameters
     * @returns Promise<FileUploadResult>
     */
    async uploadFile(params: FileUploadParams): Promise<FileUploadResult> {
        if (!this.isInitialized() || !this.storage) {
            throw new Error('GCP Storage provider not initialized');
        }

        try {
            // Generate a unique filename
            const fileExtension = path.extname(params.originalName);
            const fileName = `${randomUUID()}${fileExtension}`;
            const bucketName = params.bucketName || this.bucketName;

            // Construct file path
            const uploadPath = params.uploadPath ? `${params.uploadPath.replace(/\/$/, '')}/${fileName}` : fileName;

            // Get bucket reference
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(uploadPath);

            // Upload file
            await file.save(params.fileBuffer, {
                metadata: {
                    contentType: params.mimeType
                }
            });

            // Return file metadata
            return {
                fileName,
                originalName: params.originalName,
                mimeType: params.mimeType,
                fileSize: params.fileBuffer.length,
                filePath: uploadPath,
                bucket: bucketName,
                provider: this.getProviderName()
            };
        } catch (error) {
            logger.error('GCP Storage upload failed:', error);
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate signed URL for file access
     * @param bucketName - Storage bucket name
     * @param filePath - Path to the file
     * @param expiryHours - URL expiry time in hours
     * @returns Promise<string> - Signed URL
     */
    async generateSignedUrl(bucketName: string, filePath: string, expiryHours: number): Promise<string> {
        if (!this.isInitialized() || !this.storage) {
            throw new Error('GCP Storage provider not initialized');
        }

        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(filePath);

            // Calculate expiry time in seconds
            const expirySeconds = expiryHours * 60 * 60;

            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + expirySeconds * 1000
            });

            return url;
        } catch (error) {
            logger.error('GCP Storage signed URL generation failed:', error);
            throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete file from storage
     * @param bucketName - Storage bucket name
     * @param filePath - Path to the file
     * @returns Promise<boolean>
     */
    async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
        if (!this.isInitialized() || !this.storage) {
            throw new Error('GCP Storage provider not initialized');
        }

        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(filePath);

            // Check if file exists
            const [exists] = await file.exists();
            if (!exists) {
                throw new Error(`File ${filePath} not found in bucket ${bucketName}`);
            }

            // Delete the file
            await file.delete();
            return true;
        } catch (error) {
            logger.error('GCP Storage delete failed:', error);
            throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 