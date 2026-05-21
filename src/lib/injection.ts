/**
 * LLM Injection Encoding Engine
 * 
 * Provides advanced encoding capabilities for LLM penetration testing,
 * including multiple encoding variants and embedding positions.
 */

import type {
  InjectionOptions,
  InjectionResult,
  EncodingVariant,
  EmbedPosition,
} from '@/types';
import { ENCODING_VARIANTS, CHAR_NAMES } from './constants';

/**
 * Convert text to binary representation
 */
function textToBinary(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Map binary to zero-width characters based on encoding variant
 */
function binaryToHidden(binary: string, variant: EncodingVariant): string {
  const chars = ENCODING_VARIANTS[variant].chars;
  // Use first two chars for 0 and 1, third as delimiter if available
  const zeroChar = chars[0];
  const oneChar = chars[1] || chars[0];
  
  return binary
    .split('')
    .map(bit => (bit === '1' ? oneChar : zeroChar))
    .join('');
}

/**
 * Generate a simple hash for the payload
 */
function generateHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Get character breakdown for the hidden payload
 */
function getCharBreakdown(hiddenPayload: string): InjectionResult['charBreakdown'] {
  const counts: Record<string, number> = {};
  
  for (const char of hiddenPayload) {
    counts[char] = (counts[char] || 0) + 1;
  }
  
  return Object.entries(counts).map(([char, count]) => ({
    char,
    name: CHAR_NAMES[char] || 'Unknown',
    count,
    unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
  }));
}

/**
 * Convert hidden payload to hex view
 */
function toHexView(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

/**
 * Embed hidden payload into carrier text based on position
 */
function embedPayload(
  carrierText: string,
  hiddenPayload: string,
  position: EmbedPosition
): string {
  switch (position) {
    case 'prefix':
      return hiddenPayload + carrierText;
    
    case 'suffix':
      return carrierText + hiddenPayload;
    
    case 'interleaved': {
      // Insert hidden chars between each visible character
      const chars = carrierText.split('');
      const hiddenChars = hiddenPayload.split('');
      const charsPerGap = Math.ceil(hiddenChars.length / Math.max(chars.length - 1, 1));
      
      let result = '';
      let hiddenIndex = 0;
      
      for (let i = 0; i < chars.length; i++) {
        result += chars[i];
        if (i < chars.length - 1 && hiddenIndex < hiddenChars.length) {
          const chunk = hiddenChars.slice(hiddenIndex, hiddenIndex + charsPerGap).join('');
          result += chunk;
          hiddenIndex += charsPerGap;
        }
      }
      // Append any remaining hidden chars
      if (hiddenIndex < hiddenChars.length) {
        result += hiddenChars.slice(hiddenIndex).join('');
      }
      return result;
    }
    
    case 'sandwich': {
      // Split payload in half, put before and after
      const midpoint = Math.floor(hiddenPayload.length / 2);
      const firstHalf = hiddenPayload.slice(0, midpoint);
      const secondHalf = hiddenPayload.slice(midpoint);
      return firstHalf + carrierText + secondHalf;
    }
    
    default:
      return carrierText + hiddenPayload;
  }
}

/**
 * Encode an injection payload with the specified options
 */
export function encodeInjection(options: InjectionOptions): InjectionResult {
  const { payload, carrierText, position, encodingVariant, repetitions } = options;

  const emptyResult: InjectionResult = {
    success: false,
    output: '',
    payload: '',
    metadata: {
      timestamp: new Date().toISOString(),
      encodingMethod: encodingVariant,
      payloadHash: '',
      charCount: 0,
      hiddenCharCount: 0,
      visibleText: carrierText,
      position,
      repetitions,
    },
    charBreakdown: [],
    hexView: '',
  };

  // Validate inputs
  if (!payload || payload.trim().length === 0) {
    return { ...emptyResult, error: 'Injection payload cannot be empty' };
  }

  if (!carrierText || carrierText.trim().length === 0) {
    if (position === 'interleaved' || position === 'sandwich') {
      return { ...emptyResult, error: `Carrier text is required for ${position} position` };
    }
  }

  // Repeat payload if specified
  const repeatedPayload = payload.repeat(Math.max(1, Math.min(repetitions, 10)));

  // Convert to binary and then to hidden characters
  const binary = textToBinary(repeatedPayload);
  const hiddenPayload = binaryToHidden(binary, encodingVariant);

  // Embed into carrier text
  const output = embedPayload(carrierText || '', hiddenPayload, position);

  // Generate metadata
  const charBreakdown = getCharBreakdown(hiddenPayload);
  const hexView = toHexView(hiddenPayload);
  const payloadHash = generateHash(payload);

  return {
    success: true,
    output,
    payload: repeatedPayload,
    metadata: {
      timestamp: new Date().toISOString(),
      encodingMethod: encodingVariant,
      payloadHash,
      charCount: output.length,
      hiddenCharCount: hiddenPayload.length,
      visibleText: carrierText || '',
      position,
      repetitions: Math.max(1, Math.min(repetitions, 10)),
    },
    charBreakdown,
    hexView,
  };
}

/**
 * Export injection result to various formats
 */
export function exportInjection(
  result: InjectionResult,
  format: 'json' | 'csv' | 'jsonl'
): string {
  const data = {
    output: result.output,
    payload: result.payload,
    ...result.metadata,
    charBreakdown: result.charBreakdown,
  };

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);

    case 'jsonl':
      return JSON.stringify(data);

    case 'csv': {
      const headers = [
        'timestamp',
        'encodingMethod',
        'payloadHash',
        'charCount',
        'hiddenCharCount',
        'position',
        'repetitions',
        'visibleText',
        'payload',
        'output',
      ];
      const values = [
        result.metadata.timestamp,
        result.metadata.encodingMethod,
        result.metadata.payloadHash,
        result.metadata.charCount.toString(),
        result.metadata.hiddenCharCount.toString(),
        result.metadata.position,
        result.metadata.repetitions.toString(),
        `"${result.metadata.visibleText.replace(/"/g, '""')}"`,
        `"${result.payload.replace(/"/g, '""')}"`,
        `"${result.output.replace(/"/g, '""')}"`,
      ];
      return `${headers.join(',')}\n${values.join(',')}`;
    }

    default:
      return JSON.stringify(data, null, 2);
  }
}

