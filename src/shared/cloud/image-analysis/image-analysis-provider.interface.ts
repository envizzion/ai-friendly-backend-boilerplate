import { CloudProvider } from '../cloud-provider.interface.js';

// TODO: Move these types to shared types when migrating image analysis feature
export interface AnalyzeImageRequest {
  imageBase64: string;
  features?: Array<'TEXT_DETECTION' | 'DOCUMENT_TEXT_DETECTION' | 'LABEL_DETECTION'>;
}

export interface ImageAnalysisResult {
  success: boolean;
  textAnnotations: Array<{
    description: string;
    boundingPoly: {
      vertices: Array<{ x: number; y: number }>;
    };
    confidence?: number;
  }>;
  error?: string;
}

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