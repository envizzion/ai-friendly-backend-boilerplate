import { logger } from '@shared/logger.js';
import {
    AnalyzeImageRequest,
    DetectedPartLabel,
    ImageAnalysisResult
} from '@types/dto/image-analysis.dto.js';
import {
    BoundingBox,
    DetectDocumentTextCommand,
    TextractClient
} from '@aws-sdk/client-textract';
import { AWSCloudProvider, AWSCredentials } from '../aws-cloud-provider.js';
import { AWSConfig } from '../cloud-provider.interface.js';
import { ImageAnalysisProvider } from './image-analysis-provider.interface.js';

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

        if (!request.imageUrl) {
            throw new Error('Image URL is required for analysis');
        }

        const startTime = Date.now();

        try {
            // AWS Textract requires the image to be in S3 or as bytes
            // For URLs, we need to fetch the image first
            const imageBytes = await this.fetchImageAsBytes(request.imageUrl);

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

            const detectedLabels: DetectedPartLabel[] = [];

            for (const block of wordBlocks) {
                const text = block.Text?.trim();
                if (!text) continue;

                // Filter only numbers if requested
                if (request.filterOnlyNumbers !== false) {
                    if (!/^\d+$/.test(text)) continue;
                }

                // Check confidence threshold
                const confidence = block.Confidence ? block.Confidence / 100 : 0;
                if (confidence < (request.minConfidence || 0.5)) continue;

                // Extract bounding box coordinates
                const boundingBox = block.Geometry?.BoundingBox;
                if (!boundingBox) continue;

                const coordinates = this.calculateBoundingBox(boundingBox);

                detectedLabels.push({
                    label: text,
                    value: Number(text),
                    coordinates,
                    confidence
                });
            }
            detectedLabels.sort((a, b) => b.value - a.value);
            const processingTime = Date.now() - startTime;

            return {
                imageUrl: request.imageUrl,
                detectedLabels,
                totalLabelsFound: detectedLabels.length,
                processingTime
            };

        } catch (error) {
            logger.error('AWS Textract analysis failed:', error);
            throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Fetch image from URL and convert to bytes
     * @param url - Image URL
     * @returns Promise<Uint8Array>
     */
    private async fetchImageAsBytes(url: string): Promise<Uint8Array> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    /**
     * Calculate bounding box from AWS Textract BoundingBox
     * @param boundingBox - AWS Textract BoundingBox
     * @returns Normalized bounding box
     */
    private calculateBoundingBox(boundingBox: BoundingBox): {
        x: number;
        y: number;
        width: number;
        height: number;
    } {
        // AWS Textract returns normalized coordinates (0-1)
        // We need to convert them to absolute pixel values
        // For this example, we'll keep them normalized and let the consumer scale them
        return {
            x: boundingBox.Left || 0,
            y: boundingBox.Top || 0,
            width: boundingBox.Width || 0,
            height: boundingBox.Height || 0
        };
    }
} 