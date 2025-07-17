import { logger } from '@shared/logger.js';
import {
    BoundingBox,
    DetectDocumentTextCommand,
    TextractClient
} from '@aws-sdk/client-textract';
import { AWSCloudProvider, AWSCredentials } from '../aws-cloud-provider.js';
import { AWSConfig } from '../cloud-provider.interface.js';
import { 
    ImageAnalysisProvider, 
    AnalyzeImageRequest, 
    ImageAnalysisResult 
} from './image-analysis-provider.interface.js';

/**
 * AWS Textract implementation of ImageAnalysisProvider
 */
export class AwsTextractProvider implements ImageAnalysisProvider {
    private client: TextractClient | null = null;
    private initialized = false;
    private readonly baseProvider: AWSCloudProvider;

    /**
     * Constructor
     * @param baseProvider - Base AWS cloud provider
     */
    constructor(baseProvider: AWSCloudProvider) {
        this.baseProvider = baseProvider;
    }

    /**
     * Initialize the AWS Textract client
     * @param config - Optional cloud provider configuration
     */
    public async initialize(config?: AWSConfig): Promise<void> {
        if (!this.baseProvider.isInitialized()) {
            throw new Error('Base AWS provider must be initialized before Textract provider');
        }

        try {
            const credentials = this.getCredentials();

            this.client = new TextractClient({
                region: credentials.region,
                credentials: {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey
                }
            });
            this.initialized = true;
            logger.info(`AWS Textract client initialized for region ${credentials.region}`);
        } catch (error) {
            logger.error('Failed to initialize AWS Textract provider:', error);
            throw new Error(`Failed to initialize AWS Textract provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getProviderName(): string {
        return 'aws-textract';
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get credentials from the base provider
     */
    private getCredentials(): AWSCredentials {
        try {
            // Use protected method from base class via type assertion
            return (this.baseProvider as any).getCredentials();
        } catch (error) {
            throw new Error('Failed to get AWS credentials from base provider');
        }
    }

    /**
     * Analyze image using AWS Textract
     * @param request - Analysis request parameters
     * @returns Promise<ImageAnalysisResult>
     */
    async analyzeImage(request: AnalyzeImageRequest): Promise<ImageAnalysisResult> {
        if (!this.isInitialized() || !this.client) {
            throw new Error('AWS Textract provider not initialized');
        }

        if (!request.imageBase64) {
            throw new Error('Base64 image data is required for analysis');
        }

        try {
            // Convert base64 to bytes for AWS Textract
            const imageBytes = Buffer.from(request.imageBase64, 'base64');

            // Call AWS Textract
            const command = new DetectDocumentTextCommand({
                Document: {
                    Bytes: imageBytes
                }
            });

            const response = await this.client.send(command);
            const blocks = response.Blocks || [];

            // Filter for WORD blocks (similar to individual text elements)
            const wordBlocks = blocks.filter(block => block.BlockType === 'WORD');

            const textAnnotations = [];

            for (const block of wordBlocks) {
                const text = block.Text?.trim();
                if (!text) continue;

                // Extract bounding box coordinates
                const boundingBox = block.Geometry?.BoundingBox;
                if (!boundingBox) continue;

                const vertices = this.convertBoundingBoxToVertices(boundingBox);

                textAnnotations.push({
                    description: text,
                    boundingPoly: {
                        vertices
                    },
                    confidence: block.Confidence ? block.Confidence / 100 : 0
                });
            }

            return {
                success: true,
                textAnnotations
            };

        } catch (error) {
            logger.error('AWS Textract analysis failed:', error);
            return {
                success: false,
                textAnnotations: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Convert AWS Textract BoundingBox to vertices format
     * @param boundingBox - AWS Textract BoundingBox
     * @returns Array of vertices
     */
    private convertBoundingBoxToVertices(boundingBox: BoundingBox): Array<{ x: number; y: number }> {
        // AWS Textract returns normalized coordinates (0-1)
        const left = boundingBox.Left || 0;
        const top = boundingBox.Top || 0;
        const width = boundingBox.Width || 0;
        const height = boundingBox.Height || 0;

        // Convert to vertices (assuming 1000x1000 pixel image for now)
        const imageWidth = 1000;
        const imageHeight = 1000;

        return [
            { x: left * imageWidth, y: top * imageHeight },
            { x: (left + width) * imageWidth, y: top * imageHeight },
            { x: (left + width) * imageWidth, y: (top + height) * imageHeight },
            { x: left * imageWidth, y: (top + height) * imageHeight }
        ];
    }
} 