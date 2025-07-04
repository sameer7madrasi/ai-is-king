export type EntryType = 'text' | 'voice' | 'file' | 'api' | 'image';
export type EntrySource = 'manual' | 'upload' | 'apple_health' | 'google_fit' | 'api' | 'other';

export interface EntryMetadata {
  filename?: string | null;
  mimetype?: string | null;
  duration?: number | null; // For audio/video
  extractedData?: any;      // For structured/parsed data
  raw?: any;                // Raw data if needed
}

export interface UnifiedEntry {
  id: string;
  userId: string;
  type: EntryType;
  source: EntrySource;
  content: string;           // Text, extracted text, or transcript
  fileUrl?: string | null;   // For files/voice/images
  metadata?: EntryMetadata;
  timestamp: string;         // ISO8601
  createdAt: string;         // ISO8601
  updatedAt: string;         // ISO8601
} 