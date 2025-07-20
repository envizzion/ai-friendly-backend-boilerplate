# 🌩️ Cloud Providers Documentation

## Overview

The Parts App includes a comprehensive cloud provider system that supports multiple cloud services for storage, AI analysis, and image processing. The system is designed with a modular architecture that allows easy switching between providers and adding new ones.

## 📁 Architecture

```
src/shared/cloud/
├── index.ts                              # Unified exports & factory
├── cloud-provider.interface.ts           # Base interfaces & registry
├── aws-cloud-provider.ts                 # AWS base provider
├── gcp-cloud-provider.ts                 # GCP base provider
├── storage/
│   ├── storage-provider.interface.ts     # Storage abstraction
│   └── gcp-storage-provider.ts           # Google Cloud Storage
├── ai-analysis/
│   ├── ai-analysis-provider.interface.ts # AI analysis abstraction
│   └── gemini-ai-provider.ts             # Google Gemini AI
└── image-analysis/
    ├── image-analysis-provider.interface.ts # Image analysis abstraction
    ├── aws-textract-provider.ts             # AWS Textract
    └── gcp-vision-provider.ts               # Google Vision API
```

## 🛠️ Provider Types

### 1. **Base Cloud Providers**
- **AWS Cloud Provider**: Manages AWS credentials and authentication
- **GCP Cloud Provider**: Manages Google Cloud credentials and authentication

### 2. **Storage Providers**
- **GCP Storage Provider**: File upload, download, and CDN URL generation

### 3. **AI Analysis Providers**
- **Gemini AI Provider**: Parts catalog analysis using Google's Gemini AI

### 4. **Image Analysis Providers**
- **AWS Textract Provider**: Text extraction from images using AWS Textract
- **GCP Vision Provider**: Image analysis using Google Vision API

## ⚙️ Configuration

### Environment Variables

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# GCP Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GCP_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=your-storage-bucket

# Optional: Override defaults
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Service Account Setup

#### **AWS Setup**
1. Create IAM user with appropriate permissions
2. Generate access key and secret key
3. Set environment variables

#### **GCP Setup**
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path
4. Enable required APIs:
   - Cloud Storage API
   - Vision API
   - Vertex AI API

## 🚀 Quick Start

### Basic Usage

```typescript
import { CloudProviderFactory } from '@shared/cloud/index.js';

// Initialize cloud providers
async function initializeCloudServices() {
  try {
    // Initialize AWS services
    const aws = await CloudProviderFactory.initializeAWS();
    console.log('AWS providers initialized:', aws);

    // Initialize GCP services  
    const gcp = await CloudProviderFactory.initializeGCP();
    console.log('GCP providers initialized:', gcp);

  } catch (error) {
    console.error('Failed to initialize cloud providers:', error);
  }
}
```

### Individual Provider Usage

```typescript
import { 
  GCPCloudProvider, 
  GcpStorageProvider,
  GeminiAIProvider 
} from '@shared/cloud/index.js';

// Manual provider initialization
async function setupGCPProviders() {
  const gcpProvider = GCPCloudProvider.getInstance();
  await gcpProvider.initialize();

  const storageProvider = new GcpStorageProvider(gcpProvider);
  await storageProvider.initialize();

  const aiProvider = new GeminiAIProvider(gcpProvider);
  await aiProvider.initialize();

  return { gcpProvider, storageProvider, aiProvider };
}
```

## 📋 Detailed Usage Examples

### 1. **File Storage Operations**

```typescript
import { CloudProviderFactory } from '@shared/cloud/index.js';

class FileService {
  private storageProvider: GcpStorageProvider;

  async initialize() {
    const { storageProvider } = await CloudProviderFactory.initializeGCP();
    this.storageProvider = storageProvider;
  }

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string) {
    try {
      const result = await this.storageProvider.uploadFile({
        fileBuffer,
        originalName,
        mimeType,
        bucketName: 'my-parts-bucket',
        uploadPath: 'parts-images',
        tags: ['parts', 'catalog']
      });

      console.log('File uploaded:', result);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  async generateSignedUrl(bucketName: string, filePath: string) {
    try {
      const url = await this.storageProvider.generateSignedUrl(
        bucketName, 
        filePath, 
        24 // 24 hours expiry
      );

      console.log('Signed URL generated:', url);
      return url;
    } catch (error) {
      console.error('URL generation failed:', error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, filePath: string) {
    try {
      const deleted = await this.storageProvider.deleteFile(bucketName, filePath);
      console.log('File deleted:', deleted);
      return deleted;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
```

### 2. **AI Parts Catalog Analysis**

```typescript
import { CloudProviderFactory, PartsCatalogAnalysisRequest } from '@shared/cloud/index.js';

class AIAnalysisService {
  private geminiProvider: GeminiAIProvider;

  async initialize() {
    const { geminiProvider } = await CloudProviderFactory.initializeGCP();
    this.geminiProvider = geminiProvider;
  }

  async analyzePartsCatalog(imageBase64: string, brand: string, model: string) {
    try {
      const request: PartsCatalogAnalysisRequest = {
        imageBase64,
        brand,
        model,
        year: 2023,
        maxPartCount: 50
      };

      const result = await this.geminiProvider.analyzePartsCatalog(request);
      
      if (result.success) {
        console.log(`Found ${result.totalParts} parts:`);
        result.parts.forEach((part, index) => {
          console.log(`${index + 1}. ${part.partName} (${part.partNumber})`);
        });
      } else {
        console.error('Analysis failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }
}
```

### 3. **Image Text Extraction**

```typescript
import { CloudProviderFactory, AnalyzeImageRequest } from '@shared/cloud/index.js';

class ImageAnalysisService {
  private textractProvider: AwsTextractProvider;

  async initialize() {
    const { textractProvider } = await CloudProviderFactory.initializeAWS();
    this.textractProvider = textractProvider;
  }

  async extractTextFromImage(imageBase64: string) {
    try {
      const request: AnalyzeImageRequest = {
        imageBase64,
        features: ['TEXT_DETECTION', 'DOCUMENT_TEXT_DETECTION']
      };

      const result = await this.textractProvider.analyzeImage(request);

      if (result.success) {
        console.log(`Found ${result.textAnnotations.length} text elements:`);
        result.textAnnotations.forEach((annotation, index) => {
          console.log(`${index + 1}. "${annotation.description}" (confidence: ${annotation.confidence})`);
        });
      } else {
        console.error('Text extraction failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  }
}
```

## 🏗️ Integration in Feature-Based Architecture

### Service Layer Integration

```typescript
// src/features/common/file-upload/file-upload.service.ts
import { CloudProviderFactory, GcpStorageProvider } from '@shared/cloud/index.js';

export class FileUploadService {
  private storageProvider: GcpStorageProvider;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    const { storageProvider } = await CloudProviderFactory.initializeGCP();
    this.storageProvider = storageProvider;
    this.initialized = true;
  }

  async uploadFile(params: FileUploadParams) {
    await this.initialize();
    return this.storageProvider.uploadFile(params);
  }

  async generateCDNUrl(bucketName: string, filePath: string, expiryHours: number = 24) {
    await this.initialize();
    return this.storageProvider.generateSignedUrl(bucketName, filePath, expiryHours);
  }
}
```

### Controller Integration

```typescript
// src/features/common/ai-analysis/ai-analysis.controller.ts
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { CloudProviderFactory } from '@shared/cloud/index.js';

export class AIAnalysisController {
  private geminiProvider: GeminiAIProvider;

  async initialize() {
    const { geminiProvider } = await CloudProviderFactory.initializeGCP();
    this.geminiProvider = geminiProvider;
  }

  async analyzePartsCatalog(c: Context) {
    const { imageBase64, brand, model } = await c.req.json();
    
    const result = await this.geminiProvider.analyzePartsCatalog({
      imageBase64,
      brand,
      model
    });

    return c.json(result);
  }
}
```

## 🔧 Server Integration

```typescript
// src/server.ts - Add to Server class
import { CloudProviderFactory } from '@shared/cloud/index.js';

class Server {
  private cloudProviders: any = {};

  async configure() {
    // ... existing middleware setup

    // Initialize cloud providers
    await this.initializeCloudProviders();

    // ... rest of configuration
  }

  private async initializeCloudProviders() {
    try {
      // Initialize based on available environment variables
      if (process.env.AWS_ACCESS_KEY_ID) {
        this.cloudProviders.aws = await CloudProviderFactory.initializeAWS();
        logger.info('AWS cloud providers initialized');
      }

      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.cloudProviders.gcp = await CloudProviderFactory.initializeGCP();
        logger.info('GCP cloud providers initialized');
      }

      logger.info('Cloud providers initialization complete');
    } catch (error) {
      logger.error('Failed to initialize cloud providers:', error);
      // Don't fail server startup, just log the error
    }
  }

  getCloudProviders() {
    return this.cloudProviders;
  }
}
```

## 🧪 Testing Cloud Providers

### Unit Testing

```typescript
// tests/cloud-providers.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GCPCloudProvider, GcpStorageProvider } from '@shared/cloud/index.js';

describe('Cloud Providers', () => {
  let gcpProvider: GCPCloudProvider;
  let storageProvider: GcpStorageProvider;

  beforeEach(async () => {
    gcpProvider = GCPCloudProvider.getInstance();
    await gcpProvider.initialize();
    
    storageProvider = new GcpStorageProvider(gcpProvider);
    await storageProvider.initialize();
  });

  it('should initialize GCP provider', () => {
    expect(gcpProvider.isInitialized()).toBe(true);
    expect(gcpProvider.getProviderName()).toBe('gcp');
  });

  it('should initialize storage provider', () => {
    expect(storageProvider.isInitialized()).toBe(true);
    expect(storageProvider.getProviderName()).toBe('gcp-storage');
  });

  it('should upload file successfully', async () => {
    const testBuffer = Buffer.from('test file content');
    
    const result = await storageProvider.uploadFile({
      fileBuffer: testBuffer,
      originalName: 'test.txt',
      mimeType: 'text/plain',
      bucketName: 'test-bucket'
    });

    expect(result.fileName).toBeDefined();
    expect(result.fileSize).toBe(testBuffer.length);
  });
});
```

### Integration Testing

```typescript
// tests/integration/cloud-integration.test.ts
import { CloudProviderFactory } from '@shared/cloud/index.js';

describe('Cloud Provider Integration', () => {
  it('should initialize all GCP providers', async () => {
    const providers = await CloudProviderFactory.initializeGCP();
    
    expect(providers.cloudProvider.isInitialized()).toBe(true);
    expect(providers.storageProvider.isInitialized()).toBe(true);
    expect(providers.geminiProvider.isInitialized()).toBe(true);
    expect(providers.visionProvider.isInitialized()).toBe(true);
  });

  it('should perform end-to-end file upload and analysis', async () => {
    const { storageProvider, geminiProvider } = await CloudProviderFactory.initializeGCP();
    
    // Upload test image
    const testImage = Buffer.from('mock-image-data');
    const uploadResult = await storageProvider.uploadFile({
      fileBuffer: testImage,
      originalName: 'test-parts-diagram.jpg',
      mimeType: 'image/jpeg',
      bucketName: 'test-bucket'
    });

    // Generate signed URL
    const signedUrl = await storageProvider.generateSignedUrl(
      uploadResult.bucket,
      uploadResult.filePath,
      1
    );

    expect(signedUrl).toContain('googleapis.com');
  });
});
```

## 🚨 Error Handling

### Provider Initialization Errors

```typescript
import { CloudProviderFactory } from '@shared/cloud/index.js';

async function robustCloudInitialization() {
  const providers: any = {};

  // Try AWS initialization
  try {
    providers.aws = await CloudProviderFactory.initializeAWS();
    logger.info('AWS providers ready');
  } catch (error) {
    logger.warn('AWS providers not available:', error.message);
  }

  // Try GCP initialization
  try {
    providers.gcp = await CloudProviderFactory.initializeGCP();
    logger.info('GCP providers ready');
  } catch (error) {
    logger.warn('GCP providers not available:', error.message);
  }

  return providers;
}
```

### Operation Error Handling

```typescript
async function safeFileUpload(storageProvider: GcpStorageProvider, params: FileUploadParams) {
  try {
    const result = await storageProvider.uploadFile(params);
    return { success: true, data: result };
  } catch (error) {
    logger.error('File upload failed:', {
      error: error.message,
      fileName: params.originalName,
      bucketName: params.bucketName
    });
    
    return { 
      success: false, 
      error: error.message,
      retryable: error.message.includes('timeout') || error.message.includes('network')
    };
  }
}
```

## 📊 Monitoring and Logging

### Performance Monitoring

```typescript
import { logger } from '@shared/logger.js';

class CloudProviderMonitor {
  static async monitorOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    providerName: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      logger.info('Cloud operation completed', {
        operation: operationName,
        provider: providerName,
        duration: `${duration}ms`,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Cloud operation failed', {
        operation: operationName,
        provider: providerName,
        duration: `${duration}ms`,
        error: error.message,
        success: false
      });
      
      throw error;
    }
  }
}

// Usage
const result = await CloudProviderMonitor.monitorOperation(
  () => storageProvider.uploadFile(params),
  'uploadFile',
  'gcp-storage'
);
```

## 🔄 Provider Registry Usage

```typescript
import { CloudProviderFactory } from '@shared/cloud/index.js';

// Initialize providers
await CloudProviderFactory.initializeGCP();

// Get providers from registry
const gcpProvider = CloudProviderFactory.getProvider<GCPCloudProvider>('gcp');
const storageProvider = CloudProviderFactory.getProvider<GcpStorageProvider>('gcp-storage');
const geminiProvider = CloudProviderFactory.getProvider<GeminiAIProvider>('gemini');

// Check if provider is available
if (CloudProviderFactory.hasProvider('aws-textract')) {
  const textractProvider = CloudProviderFactory.getProvider<AwsTextractProvider>('aws-textract');
  // Use textract provider
}
```

## 🔮 Adding New Providers

### 1. Create Provider Interface

```typescript
// src/shared/cloud/translation/translation-provider.interface.ts
import { CloudProvider } from '../cloud-provider.interface.js';

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  confidence: number;
}

export interface TranslationProvider extends CloudProvider {
  translateText(request: TranslationRequest): Promise<TranslationResult>;
}
```

### 2. Implement Provider

```typescript
// src/shared/cloud/translation/gcp-translate-provider.ts
import { GCPCloudProvider } from '../gcp-cloud-provider.js';
import { TranslationProvider, TranslationRequest, TranslationResult } from './translation-provider.interface.js';

export class GcpTranslateProvider implements TranslationProvider {
  constructor(private baseProvider: GCPCloudProvider) {}

  async initialize(): Promise<void> {
    // Implementation
  }

  getProviderName(): string {
    return 'gcp-translate';
  }

  isInitialized(): boolean {
    // Implementation
  }

  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    // Implementation
  }
}
```

### 3. Update Factory and Exports

```typescript
// Add to src/shared/cloud/index.ts
export { GcpTranslateProvider } from './translation/gcp-translate-provider.js';
export type { TranslationProvider, TranslationRequest, TranslationResult } from './translation/translation-provider.interface.js';

// Update CloudProviderFactory
static async initializeGCP() {
  // ... existing code
  const translateProvider = new GcpTranslateProvider(cloudProvider);
  await translateProvider.initialize();
  
  this.registry.registerProvider('gcp-translate', translateProvider);
  
  return { 
    // ... existing providers
    translateProvider 
  };
}
```

## 📚 Best Practices

### 1. **Environment-Based Initialization**
- Only initialize providers with available credentials
- Gracefully handle missing providers
- Log provider availability at startup

### 2. **Error Handling**
- Always wrap provider operations in try-catch
- Provide meaningful error messages
- Log errors with context for debugging

### 3. **Performance**
- Initialize providers once at startup
- Use connection pooling where available
- Monitor operation duration and costs

### 4. **Security**
- Never log credentials or sensitive data
- Use environment variables for configuration
- Rotate credentials regularly
- Follow principle of least privilege

### 5. **Testing**
- Mock providers in unit tests
- Use test environments for integration tests
- Test error scenarios and edge cases

This documentation provides a comprehensive guide to using the cloud provider system in the Parts App. The modular architecture makes it easy to add new providers and services while maintaining type safety and consistency across the application.