import { CloudProvider } from '../cloud-provider.interface.js';

// TODO: Move these types to shared types when migrating AI analysis feature
export interface PartsCatalogAnalysisRequest {
  imageBase64: string;
  brand: string;
  model: string;
  year?: number;
  maxPartCount?: number;
}

export interface PartsCatalogAnalysisResult {
  success: boolean;
  parts: Array<{
    partName: string;
    partNumber: string;
    category: string;
    price?: number;
    availability?: boolean;
    description?: string;
  }>;
  totalParts: number;
  confidence: number;
  processingTime?: number;
  error?: string;
}

/**
 * Supported AI analysis provider types
 */
export type AIAnalysisProviderType = 'gemini' | 'mistral';

/**
 * Interface for AI analysis providers
 */
export interface AIAnalysisProvider extends CloudProvider {
    /**
     * Check if the AI analysis service is available
     * @returns boolean indicating if the service is available
     */
    isAvailable(): boolean;

    /**
     * Analyzes a parts catalog to extract structured parts data
     * @param request - Analysis request parameters
     * @returns Promise<PartsCatalogAnalysisResult>
     */
    analyzePartsCatalog(request: PartsCatalogAnalysisRequest): Promise<PartsCatalogAnalysisResult>;
} 