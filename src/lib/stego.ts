/**
 * EvilEmoji Steganography Engine
 * 
 * Encodes secret messages into invisible zero-width Unicode characters
 * that can be hidden inside emojis or any text.
 */

import type {
  EncodeOptions,
  EncodeResult,
  DecodeOptions,
  DecodeResult,
  EncodingMode,
  ConfidenceLevel,
} from '@/types';
import { ZERO_WIDTH, MAX_PAYLOAD_SIZE, DEFAULT_EMOJI } from './constants';
import { calculateChecksum, isValidEmoji, getVisibleLength } from './utils';

// Re-export types for convenience
export type { EncodeOptions, EncodeResult, DecodeOptions, DecodeResult, ConfidenceLevel };

/**
 * Convert a string to binary representation using UTF-8 encoding
 */
function textToBinary(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Convert binary string back to text using UTF-8 decoding
 */
function binaryToText(binary: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(new Uint8Array(bytes));
}

/**
 * Map binary string to zero-width characters
 * 0 -> ZWNJ (Zero Width Non-Joiner)
 * 1 -> ZWS (Zero Width Space)
 */
function binaryToZeroWidth(binary: string): string {
  return binary
    .split('')
    .map(bit => (bit === '1' ? ZERO_WIDTH.SPACE : ZERO_WIDTH.NON_JOINER))
    .join('');
}

/**
 * Map zero-width characters back to binary string
 */
function zeroWidthToBinary(zw: string): string {
  return zw
    .split('')
    .map(char => {
      if (char === ZERO_WIDTH.SPACE) return '1';
      if (char === ZERO_WIDTH.NON_JOINER) return '0';
      return ''; // Ignore other characters
    })
    .join('');
}

/**
 * Encode a secret message into a cover emoji or text
 */
export function encode(options: EncodeOptions): EncodeResult {
  const { secretMessage, includeChecksum = true, coverMode = 'emoji', coverText } = options;
  let { coverEmoji } = options;

  const emptyStats = { visibleLength: 0, actualByteLength: 0, binaryLength: 0, compressionRatio: 0 };

  // Validate inputs
  if (!secretMessage || secretMessage.length === 0) {
    return { success: false, payload: '', stats: emptyStats, error: 'Message cannot be empty' };
  }

  if (coverMode === 'text' && (!coverText || coverText.trim().length === 0)) {
    return { success: false, payload: '', stats: emptyStats, error: 'Cover text cannot be empty' };
  }

  // Use default emoji if none provided or invalid (emoji mode only)
  if (coverMode === 'emoji' && (!coverEmoji || !isValidEmoji(coverEmoji))) {
    coverEmoji = DEFAULT_EMOJI;
  }

  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(secretMessage);

  // Check payload size
  if (messageBytes.length > MAX_PAYLOAD_SIZE) {
    return { success: false, payload: '', stats: emptyStats, error: `Message too large. Maximum size is ${MAX_PAYLOAD_SIZE} bytes.` };
  }

  // Calculate checksum if enabled
  let dataToEncode = secretMessage;
  if (includeChecksum) {
    const checksum = calculateChecksum(messageBytes);
    dataToEncode = String.fromCharCode(checksum) + secretMessage;
  }

  // Convert to binary and then to zero-width characters
  const binary = textToBinary(dataToEncode);
  const zeroWidthPayload = binaryToZeroWidth(binary);

  let payload: string;

  if (coverMode === 'text' && coverText) {
    // Text mode: inject payload after the first character of the cover text
    // This makes the entire string look like normal text
    const chars = [...coverText];
    if (chars.length >= 2) {
      // Insert between first and second character
      payload = chars[0] + ZERO_WIDTH.JOINER + zeroWidthPayload + ZERO_WIDTH.JOINER + chars.slice(1).join('');
    } else {
      payload = chars[0] + ZERO_WIDTH.JOINER + zeroWidthPayload + ZERO_WIDTH.JOINER;
    }
  } else {
    // Emoji mode: [Emoji] + ZWJ + [encoded] + ZWJ
    payload = coverEmoji + ZERO_WIDTH.JOINER + zeroWidthPayload + ZERO_WIDTH.JOINER;
  }

  // Calculate stats
  const visibleLength = getVisibleLength(payload);
  const actualByteLength = new TextEncoder().encode(payload).length;
  const binaryLength = zeroWidthPayload.length;
  const compressionRatio = binaryLength / (secretMessage.length * 8);

  return {
    success: true,
    payload,
    stats: { visibleLength, actualByteLength, binaryLength, compressionRatio },
  };
}

/**
 * Extract only zero-width characters from input
 */
export function extractHiddenChars(input: string): string {
  return input
    .split('')
    .filter(char =>
      char === ZERO_WIDTH.SPACE ||
      char === ZERO_WIDTH.NON_JOINER ||
      char === ZERO_WIDTH.JOINER ||
      char === ZERO_WIDTH.WORD_JOINER ||
      char === ZERO_WIDTH.BOM
    )
    .join('');
}

/**
 * Check if input contains hidden zero-width data
 */
export function hasHiddenData(input: string): boolean {
  const hidden = extractHiddenChars(input);
  // Need at least some ZWS or ZWNJ characters (not just joiners)
  const dataChars = hidden.replace(new RegExp(ZERO_WIDTH.JOINER, 'g'), '');
  return dataChars.length > 0;
}

/**
 * Decode hidden message from input
 */
export function decode(options: DecodeOptions): DecodeResult {
  const { input, strict = false } = options;

  const emptyResult: DecodeResult = {
    success: false,
    message: null,
    confidence: 'none',
    hexView: '',
    binaryView: '',
    metadata: { hiddenCharsFound: 0, estimatedEncoding: null },
  };

  if (!input || input.length === 0) {
    return { ...emptyResult, error: 'Input is empty' };
  }

  // Extract hidden characters
  const hiddenChars = extractHiddenChars(input);

  if (hiddenChars.length === 0) {
    return { ...emptyResult, error: 'No hidden data detected' };
  }

  // Find the payload between ZWJ delimiters
  const parts = input.split(ZERO_WIDTH.JOINER);
  let payloadZw = '';

  // The payload should be between the first and last ZWJ
  if (parts.length >= 3) {
    // Join all middle parts (in case there are ZWJ in the message)
    payloadZw = parts.slice(1, -1).join('');
  } else {
    // Fallback: extract all ZWS and ZWNJ characters
    payloadZw = input
      .split('')
      .filter(char => char === ZERO_WIDTH.SPACE || char === ZERO_WIDTH.NON_JOINER)
      .join('');
  }

  if (payloadZw.length === 0) {
    return {
      ...emptyResult,
      metadata: { hiddenCharsFound: hiddenChars.length, estimatedEncoding: null },
      error: 'Hidden characters found but no valid payload structure',
    };
  }

  // Convert zero-width to binary
  const binary = zeroWidthToBinary(payloadZw);
  const binaryView = binary;
  const hexView = toHexView(payloadZw);

  // Convert binary to text
  const decoded = binaryToText(binary);

  if (decoded.length === 0) {
    return {
      ...emptyResult,
      hexView,
      binaryView,
      metadata: { hiddenCharsFound: hiddenChars.length, estimatedEncoding: 'utf8' },
      error: 'Could not decode binary data to text',
    };
  }

  // Extract checksum (first byte) and verify
  const checksumByte = decoded.charCodeAt(0);
  const message = decoded.slice(1);
  const messageBytes = new TextEncoder().encode(message);
  const calculatedChecksum = calculateChecksum(messageBytes);

  let confidence: ConfidenceLevel = 'high';

  if (checksumByte !== calculatedChecksum) {
    if (strict) {
      return {
        ...emptyResult,
        hexView,
        binaryView,
        metadata: { hiddenCharsFound: hiddenChars.length, estimatedEncoding: 'utf8' },
        error: 'Checksum verification failed - data may be corrupted',
      };
    }
    // In non-strict mode, return the message but with lower confidence
    confidence = 'low';
  }

  // Check for valid text characters
  const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(message);
  if (hasInvalidChars && confidence === 'high') {
    confidence = 'medium';
  }

  return {
    success: true,
    message,
    confidence,
    hexView,
    binaryView,
    metadata: {
      hiddenCharsFound: hiddenChars.length,
      estimatedEncoding: 'utf8',
    },
  };
}

/**
 * Convert input to hexadecimal view
 */
export function toHexView(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

/**
 * Convert input to binary view (showing the zero-width encoding)
 */
export function toBinaryView(input: string): string {
  const hidden = input
    .split('')
    .filter(char => char === ZERO_WIDTH.SPACE || char === ZERO_WIDTH.NON_JOINER)
    .join('');
  return zeroWidthToBinary(hidden);
}

