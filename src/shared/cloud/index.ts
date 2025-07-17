/**
 * Cloud Providers - Unified Export
 * 
 * This file provides convenient access to all cloud providers
 * organized by functionality.
 */

// Base Cloud Provider Infrastructure
export type { CloudProvider, CloudProviderRegistry, AWSConfig, GCPConfig } from './cloud-provider.interface.js';
export { AWSCloudProvider } from './aws-cloud-provider.js';
export { GCPCloudProvider } from './gcp-cloud-provider.js';

// Storage Providers
export type { StorageProvider, FileUploadParams, FileUploadResult } from './storage/storage-provider.interface.js';
export { GcpStorageProvider } from './storage/gcp-storage-provider.js';

// AI Analysis Providers
export type { 
  AIAnalysisProvider, 
  PartsCatalogAnalysisRequest, 
  PartsCatalogAnalysisResult 
} from './ai-analysis/ai-analysis-provider.interface.js';
export { GeminiAIProvider } from './ai-analysis/gemini-ai-provider.js';

// Image Analysis Providers
export type { 
  ImageAnalysisProvider, 
  AnalyzeImageRequest, 
  ImageAnalysisResult 
} from './image-analysis/image-analysis-provider.interface.js';
export { AwsTextractProvider } from './image-analysis/aws-textract-provider.js';
export { GcpVisionProvider } from './image-analysis/gcp-vision-provider.js';

import { CloudProviderRegistry, type CloudProvider } from './cloud-provider.interface.js';
import { AWSCloudProvider } from './aws-cloud-provider.js';
import { GCPCloudProvider } from './gcp-cloud-provider.js';
import { GcpStorageProvider } from './storage/gcp-storage-provider.js';
import { GeminiAIProvider } from './ai-analysis/gemini-ai-provider.js';
import { AwsTextractProvider } from './image-analysis/aws-textract-provider.js';
import { GcpVisionProvider } from './image-analysis/gcp-vision-provider.js';

/**
 * Cloud Provider Factory
 * Helper class to initialize and manage cloud providers
 */
export class CloudProviderFactory {
  private static registry = CloudProviderRegistry.getInstance();

  /**
   * Initialize AWS providers
   */
  static async initializeAWS(): Promise<{
    cloudProvider: AWSCloudProvider;
    textractProvider: AwsTextractProvider;
  }> {
    const cloudProvider = AWSCloudProvider.getInstance();
    await cloudProvider.initialize();

    const textractProvider = new AwsTextractProvider(cloudProvider);
    await textractProvider.initialize();

    this.registry.registerProvider('aws', cloudProvider);
    this.registry.registerProvider('aws-textract', textractProvider);

    return { cloudProvider, textractProvider };
  }

  /**
   * Initialize GCP providers
   */
  static async initializeGCP(): Promise<{
    cloudProvider: GCPCloudProvider;
    storageProvider: GcpStorageProvider;
    geminiProvider: GeminiAIProvider;
    visionProvider: GcpVisionProvider;
  }> {
    const cloudProvider = GCPCloudProvider.getInstance();
    await cloudProvider.initialize();

    const storageProvider = new GcpStorageProvider(cloudProvider);
    await storageProvider.initialize();

    const geminiProvider = new GeminiAIProvider(cloudProvider);
    await geminiProvider.initialize();

    const visionProvider = new GcpVisionProvider(cloudProvider);
    await visionProvider.initialize();

    this.registry.registerProvider('gcp', cloudProvider);
    this.registry.registerProvider('gcp-storage', storageProvider);
    this.registry.registerProvider('gemini', geminiProvider);
    this.registry.registerProvider('gcp-vision', visionProvider);

    return { cloudProvider, storageProvider, geminiProvider, visionProvider };
  }

  /**
   * Get a registered provider by name
   */
  static getProvider<T extends CloudProvider>(name: string): T {
    return this.registry.getProvider<T>(name);
  }

  /**
   * Check if a provider is registered
   */
  static hasProvider(name: string): boolean {
    return this.registry.hasProvider(name);
  }
}