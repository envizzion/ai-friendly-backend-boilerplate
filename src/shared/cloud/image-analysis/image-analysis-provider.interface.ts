import { AnalyzeImageRequest, ImageAnalysisResult } from '@types/dto/image-analysis.dto.js';
import { CloudProvider } from '../cloud-provider.interface.js';

/**
 * Supported image analysis provider types
 */
export type ImageAnalysisProviderType = 'aws-textract' | 'gcp-vision';

/**
 * Interface for image analysis providers
 */
export interface ImageAnalysisProvider extends CloudProvider {
    /**
     * Analyzes an image to detect text and its coordinates
     * @param request - Analysis request parameters
     * @returns Promise<ImageAnalysisResult>
     */
    analyzeImage(request: AnalyzeImageRequest): Promise<ImageAnalysisResult>;
} 