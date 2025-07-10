import { PartsCatalogAnalysisRequest, PartsCatalogAnalysisResult } from '@/types/dto/ai-analysis.dto.js';
import { CloudProvider } from '../cloud-provider.interface.js';

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