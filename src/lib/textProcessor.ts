import { NLPProcessor, NLPResult } from './nlpProcessor';

export interface ProcessedTextData {
  id: string;
  originalText: string;
  structuredData: Record<string, any>;
  metrics: Record<string, number>;
  categories: Record<string, string[]>;
  entities: Record<string, string[]>;
  sentiment: string;
  domain: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

export class TextProcessor {
  /**
   * Process plain text using advanced NLP
   */
  static async processText(text: string): Promise<ProcessedTextData> {
    console.log('TextProcessor: Processing text with advanced NLP...');
    
    try {
      // Use the advanced NLP processor
      const nlpResult: NLPResult = await NLPProcessor.processText(text);
      
      const processedData: ProcessedTextData = {
        id: this.generateId(),
        originalText: nlpResult.originalText,
        structuredData: nlpResult.extractedData.structuredData,
        metrics: nlpResult.extractedData.metrics,
        categories: nlpResult.extractedData.categories,
        entities: nlpResult.extractedData.entities,
        sentiment: nlpResult.extractedData.sentiment,
        domain: nlpResult.domain,
        insights: nlpResult.insights,
        recommendations: nlpResult.recommendations,
        confidence: nlpResult.extractedData.confidence,
        timestamp: new Date().toISOString()
      };
      
      console.log('TextProcessor: Successfully processed text with NLP');
      console.log('Extracted metrics:', processedData.metrics);
      console.log('Detected domain:', processedData.domain);
      console.log('Generated insights:', processedData.insights);
      
      return processedData;
    } catch (error) {
      console.error('TextProcessor: Error processing text:', error);
      throw new Error(`Failed to process text: ${error}`);
    }
  }

  /**
   * Generate unique ID for processed data
   */
  private static generateId(): string {
    return `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate text input
   */
  static validateText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Text cannot be empty' };
    }
    
    if (text.length > 10000) {
      return { isValid: false, error: 'Text is too long (max 10,000 characters)' };
    }
    
    return { isValid: true };
  }

  /**
   * Format processed data for display
   */
  static formatForDisplay(data: ProcessedTextData): Record<string, any> {
    return {
      id: data.id,
      originalText: data.originalText,
      metrics: data.metrics,
      domain: data.domain,
      insights: data.insights,
      recommendations: data.recommendations,
      confidence: data.confidence,
      timestamp: data.timestamp
    };
  }
} 