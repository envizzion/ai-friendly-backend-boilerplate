import { logger } from '@shared/logger.js';
import {
    AnalyzeImageRequest,
    ImageAnalysisResult
} from './image-analysis-provider.interface.js';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GCPConfig } from '../cloud-provider.interface.js';
import { GCPCloudProvider, GCPCredentials } from '../gcp-cloud-provider.js';
import { ImageAnalysisProvider } from './image-analysis-provider.interface.js';

/**
 * Google Cloud Vision implementation of ImageAnalysisProvider
 */
export class GcpVisionProvider implements ImageAnalysisProvider {
    private client: ImageAnnotatorClient | null = null;
    private initialized = false;
    private readonly baseProvider: GCPCloudProvider;

    /**
     * Constructor
     * @param baseProvider - Base GCP cloud provider
     */
    constructor(baseProvider: GCPCloudProvider) {
        this.baseProvider = baseProvider;
    }

    /**
     * Initialize the Google Cloud Vision client
     * @param config - Optional cloud provider configuration
     */
    public async initialize(config?: GCPConfig): Promise<void> {
        if (!this.baseProvider.isInitialized()) {
            throw new Error('Base GCP provider must be initialized before Vision provider');
        }

        try {
            const credentials = this.getCredentials();
            this.client = new ImageAnnotatorClient({
                credentials: credentials.credentials,
                projectId: credentials.projectId
            });
            this.initialized = true;
            logger.info(`GCP Vision client initialized for project ${credentials.projectId}`);
        } catch (error) {
            logger.error('Failed to initialize GCP Vision provider:', error);
            throw new Error(`Failed to initialize GCP Vision provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getProviderName(): string {
        return 'gcp-vision';
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
     * Analyze image using Google Cloud Vision API
     * @param request - Analysis request parameters
     * @returns Promise<ImageAnalysisResult>
     */
    async analyzeImage(request: AnalyzeImageRequest): Promise<ImageAnalysisResult> {
        if (!this.isInitialized() || !this.client) {
            throw new Error('GCP Vision provider not initialized');
        }

        if (!request.imageBase64) {
            throw new Error('Base64 image data is required for analysis');
        }

        const startTime = Date.now();

        try {
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(request.imageBase64, 'base64');
            
            // Call Google Cloud Vision API
            const [result] = await this.client.textDetection({
                image: { content: imageBuffer },
                imageContext: {
                    textDetectionParams: {
                        enableTextDetectionConfidenceScore: true,

                    }
                }
            });

            const detections = result.textAnnotations || [];

            // Skip the first annotation as it contains the full text
            const individualTexts = detections.slice(1);

            const textAnnotations = [];

            for (const detection of individualTexts) {
                const text = detection.description?.trim();
                if (!text) continue;

                // Check confidence threshold
                const confidence = detection.confidence || 0;

                // Extract bounding box coordinates
                const vertices = detection.boundingPoly?.vertices;
                if (!vertices || vertices.length < 4) continue;

                textAnnotations.push({
                    description: text,
                    boundingPoly: {
                        vertices: this.convertToVertices(vertices)
                    },
                    confidence
                });
            }

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                textAnnotations
            };

        } catch (error) {
            logger.error('GCP Vision analysis failed:', error);
            return {
                success: false,
                textAnnotations: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Convert vertices to the expected format
     * @param vertices - Vertex coordinates
     * @returns Array of vertices
     */
    private convertToVertices(vertices: Array<{ x?: number | null; y?: number | null }>): Array<{ x: number; y: number }> {
        return vertices.map(v => ({
            x: v.x ?? 0,
            y: v.y ?? 0
        }));
    }
} 