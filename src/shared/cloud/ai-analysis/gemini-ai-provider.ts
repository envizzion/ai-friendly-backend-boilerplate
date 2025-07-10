import env from '@/lib/env.js';
import { logger } from '@/lib/logger.js';
import { FileUploadService } from '@/service/file-upload.service.js';
import {
    PartsCatalogAnalysisRequest,
    PartsCatalogAnalysisResult
} from '@/types/dto/ai-analysis.dto.js';
import { GoogleGenAI, Type } from '@google/genai';
import { GCPConfig } from '../cloud-provider.interface.js';
import { GCPCloudProvider, GCPCredentials } from '../gcp-cloud-provider.js';
import { AIAnalysisProvider } from './ai-analysis-provider.interface.js';

/**
 * Gemini AI implementation of AIAnalysisProvider using the new @google/genai SDK
 */
export class GeminiAIProvider implements AIAnalysisProvider {
    private client: GoogleGenAI | null = null;
    private initialized = false;
    private readonly baseProvider: GCPCloudProvider;
    private readonly fileUploadService: FileUploadService;

    /**
     * Constructor
     * @param baseProvider - Base GCP cloud provider
     * @param fileUploadService - File upload service for retrieving file URLs
     */
    constructor(baseProvider: GCPCloudProvider, fileUploadService: FileUploadService) {
        this.baseProvider = baseProvider;
        this.fileUploadService = fileUploadService;
    }

    /**
     * Initialize the Gemini AI client using Vertex AI
     * @param config - Optional cloud provider configuration
     */
    public async initialize(config?: GCPConfig): Promise<void> {
        if (!this.baseProvider.isInitialized()) {
            throw new Error('Base GCP provider must be initialized before Gemini AI provider');
        }

        try {
            // Verify that GOOGLE_APPLICATION_CREDENTIALS is set
            if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
                throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
            }

            // Get the GCP project ID from the base provider or environment
            const credentials = this.getCredentials();
            const projectId = credentials.projectId || env.GCP_PROJECT_ID;

            if (!projectId) {
                throw new Error('GCP project ID not found in credentials or environment variables');
            }

            // Initialize the client using Vertex AI authentication
            // This will automatically use the service account credentials from GOOGLE_APPLICATION_CREDENTIALS
            this.client = new GoogleGenAI({
                vertexai: true,
                project: projectId,
                location: 'us-central1', // Default location for Vertex AI
            });

            this.initialized = true;
            logger.info(`Gemini AI client initialized successfully with Vertex AI authentication for project: ${projectId}`);
        } catch (error) {
            logger.error('Failed to initialize Gemini AI client:', error);
            throw new Error(`Failed to initialize Gemini AI client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getProviderName(): string {
        return 'gemini';
    }

    public isInitialized(): boolean {
        return this.initialized && this.client !== null;
    }

    /**
     * Get credentials from the base provider (for validation purposes)
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
     * Check if Gemini AI service is available
     */
    public isAvailable(): boolean {
        return this.isInitialized();
    }

    /**
     * Analyzes a motorcycle parts catalog image to extract structured parts data
     * @param request - The parts catalog analysis request with fileId or imageUrl
     * @returns Promise<PartsCatalogAnalysisResult>
     */
    async analyzePartsCatalog(request: PartsCatalogAnalysisRequest): Promise<PartsCatalogAnalysisResult> {
        if (!this.client) {
            throw new Error('Gemini AI service not available - not properly configured');
        }

        try {
            // Get image URL
            let imageUrl = request.imageUrl;

            // If fileId is provided, get the CDN URL
            if (request.fileId) {
                const cdnUrlResponse = await this.fileUploadService.generateCDNUrl(request.fileId);
                if (!cdnUrlResponse) {
                    throw new Error(`File not found with ID: ${request.fileId}`);
                }
                imageUrl = cdnUrlResponse.cdnUrl;
            }

            // Ensure we have an imageUrl to analyze
            if (!imageUrl) {
                throw new Error('Either fileId or imageUrl must be provided');
            }

            // Fetch image and convert to base64
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const imageArrayBuffer = await response.arrayBuffer();
            const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

            // Determine MIME type from response headers or URL
            const contentType = response.headers.get('content-type') || 'image/jpeg';

            // Prepare the prompt for Gemini AI
            const prompt = this.buildAnalysisPrompt();

            // Use the new SDK's generateContent method with Vertex AI
            const result = await this.client.models.generateContent({
                model: 'gemini-2.5-flash-preview-05-20', // Use the latest Gemini 2.5 model
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: contentType,
                                    data: base64ImageData
                                }
                            },
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            diagram_reference: {
                                type: Type.STRING,
                                description: 'Section identifier or page reference'
                            },
                            parts_list: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        line_id: {
                                            type: Type.STRING,
                                            description: 'Line ID/Label number from the diagram'
                                        },
                                        part_numbers: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.STRING
                                            },
                                            description: 'Array of part numbers for this line'
                                        },
                                        english_name: {
                                            type: Type.STRING,
                                            description: 'Part name/description translated to English'
                                        }
                                    },
                                    propertyOrdering: ['line_id', 'part_numbers', 'english_name'],
                                    required: ['line_id', 'part_numbers', 'english_name']
                                }
                            }
                        },
                        propertyOrdering: ['diagram_reference', 'parts_list'],
                        required: ['diagram_reference', 'parts_list']
                    }
                }
            });

            // Parse the response
            const content = result.text;
            if (!content) {
                throw new Error('No response content received from Gemini AI');
            }

            let parsedResult: PartsCatalogAnalysisResult;
            try {
                parsedResult = JSON.parse(content);
            } catch (parseError) {
                logger.error('Failed to parse Gemini AI response:', content);
                throw new Error('Invalid JSON response from Gemini AI');
            }

            // Validate the response structure
            this.validateAnalysisResult(parsedResult);

            logger.info(`Successfully analyzed parts catalog with ${parsedResult.parts_list.length} parts found`);

            return parsedResult;

        } catch (error) {
            logger.error('Parts catalog analysis failed:', error);
            throw new Error(`Failed to analyze parts catalog: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build the analysis prompt for Gemini AI
     * @returns The formatted prompt string
     */
    private buildAnalysisPrompt(): string {
        return `
This is a motorcycle parts catalog page. Please extract ALL the information in a structured JSON format with the following requirements:

1. Extract each line/row from the parts table
2. For each line, identify:
   - Line ID/Label number (the number in the leftmost column that identifies the part in a diagram)
   - Part number(s) (usually alphanumeric codes like 12200-KM3-000, 90109-KA4-000, etc.)
   - Part name/description (TRANSLATE to English if in another language)
3. Handle cases where one line ID has multiple part numbers
4. TRANSLATE all part names/descriptions to English
5. If text appears to be in Japanese, Korean, or other languages, translate it to English
6. Be precise with part numbers and ensure all are captured
7. Look for tabular data, lists, or structured information that represents parts catalogs

Important: Translate all part names and descriptions to English for better understanding.

Return the data in this exact JSON structure:
{
    "diagram_reference": "section identifier or page reference",
    "parts_list": [
        {
            "line_id": "number",
            "part_numbers": ["part1", "part2"],
            "english_name": "part name translated to English"
        }
    ]
}

Ensure the response is valid JSON that matches this structure exactly.
        `.trim();
    }

    /**
     * Validate the analysis result structure
     * @param result - The result to validate
     * @throws Error if validation fails
     */
    private validateAnalysisResult(result: any): void {
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid result: must be an object');
        }

        if (!result.diagram_reference || typeof result.diagram_reference !== 'string') {
            throw new Error('Invalid result: diagram_reference must be a string');
        }

        if (!Array.isArray(result.parts_list)) {
            throw new Error('Invalid result: parts_list must be an array');
        }

        for (const [index, part] of result.parts_list.entries()) {
            if (!part || typeof part !== 'object') {
                throw new Error(`Invalid part at index ${index}: must be an object`);
            }

            if (!part.line_id || typeof part.line_id !== 'string') {
                throw new Error(`Invalid part at index ${index}: line_id must be a string`);
            }

            if (!Array.isArray(part.part_numbers)) {
                throw new Error(`Invalid part at index ${index}: part_numbers must be an array`);
            }

            if (!part.english_name || typeof part.english_name !== 'string') {
                throw new Error(`Invalid part at index ${index}: english_name must be a string`);
            }
        }
    }
} 