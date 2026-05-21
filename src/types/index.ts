// Encoding mode types
export type EncodingMode = 'ascii' | 'utf8' | 'utf16';

// Confidence levels for decoded messages
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

// Cover mode for encoder
export type CoverMode = 'emoji' | 'text';

// Encode options interface
export interface EncodeOptions {
  coverEmoji: string;
  coverText?: string;
  coverMode?: CoverMode;
  secretMessage: string;
  encoding?: EncodingMode;
  includeChecksum?: boolean;
}

// Encode result interface
export interface EncodeResult {
  success: boolean;
  payload: string;
  stats: {
    visibleLength: number;
    actualByteLength: number;
    binaryLength: number;
    compressionRatio: number;
  };
  error?: string;
}

// Decode options interface
export interface DecodeOptions {
  input: string;
  strict?: boolean;
}

// Decode result interface
export interface DecodeResult {
  success: boolean;
  message: string | null;
  confidence: ConfidenceLevel;
  hexView: string;
  binaryView: string;
  metadata: {
    hiddenCharsFound: number;
    estimatedEncoding: EncodingMode | null;
  };
  error?: string;
}

// Encoded payload structure (for future versioning)
export interface EncodedPayload {
  version: number;
  encoding: EncodingMode;
  checksum: number;
  length: number;
  data: string;
}

// Tab types for the UI
export type TabType = 'encoder' | 'decoder' | 'injection';

// Emoji preset type
export interface EmojiPreset {
  emoji: string;
  name: string;
}

// LLM Injection types
export type EmbedPosition = 'prefix' | 'suffix' | 'interleaved' | 'sandwich';
export type EncodingVariant = 'standard' | 'extended' | 'combining' | 'variation';

export interface InjectionPreset {
  id: string;
  name: string;
  payload: string;
  description: string;
  category: 'prompt' | 'jailbreak' | 'extraction' | 'confusion';
}

export interface InjectionOptions {
  payload: string;
  carrierText: string;
  position: EmbedPosition;
  encodingVariant: EncodingVariant;
  repetitions: number;
}

export interface InjectionResult {
  success: boolean;
  output: string;
  payload: string;
  metadata: {
    timestamp: string;
    encodingMethod: EncodingVariant;
    payloadHash: string;
    charCount: number;
    hiddenCharCount: number;
    visibleText: string;
    position: EmbedPosition;
    repetitions: number;
  };
  charBreakdown: {
    char: string;
    name: string;
    count: number;
    unicode: string;
  }[];
  hexView: string;
  error?: string;
}

export type ExportFormat = 'json' | 'csv' | 'jsonl';

