import { CloudProvider } from '../cloud-provider.interface.js';

/**
 * Supported storage provider types
 */
export type StorageProviderType = 'gcp-storage';

/**
 * Interface for file upload parameters
 */
export interface FileUploadParams {
    fileBuffer: Buffer;
    originalName: string;
    mimeType: string;
    uploadPath?: string;
    uploadedBy?: number;
    tags?: string[];
    bucketName: string;
}

/**
 * Result of a file upload operation
 */
export interface FileUploadResult {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    filePath: string;
    bucket: string;
    provider: string;
}

/**
 * Interface for storage providers
 */
export interface StorageProvider extends CloudProvider {
    /**
     * Uploads a file to cloud storage
     * @param params - File upload parameters
     * @returns Promise<FileUploadResult>
     */
    uploadFile(params: FileUploadParams): Promise<FileUploadResult>;

    /**
     * Generates a CDN URL for a file
     * @param bucketName - Storage bucket name
     * @param filePath - Path to the file
     * @param expiryHours - URL expiry time in hours
     * @returns Promise<string> - Signed URL
     */
    generateSignedUrl(bucketName: string, filePath: string, expiryHours: number): Promise<string>;

    /**
     * Deletes a file from cloud storage
     * @param bucketName - Storage bucket name
     * @param filePath - Path to the file
     * @returns Promise<boolean>
     */
    deleteFile(bucketName: string, filePath: string): Promise<boolean>;
} 