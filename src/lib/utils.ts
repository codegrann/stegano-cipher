import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Calculate XOR checksum of a Uint8Array
 */
export function calculateChecksum(data: Uint8Array): number {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum ^= data[i];
  }
  return checksum;
}

/**
 * Check if a string is a valid emoji
 */
export function isValidEmoji(str: string): boolean {
  if (!str || str.length === 0) return false;
  // Using a simplified check that works for most emojis
  const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}\uFE0F?)+$/u;
  return emojiRegex.test(str);
}

/**
 * Get visible length of a string (excluding zero-width characters)
 */
export function getVisibleLength(str: string): number {
  const zwRegex = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
  return [...str.replace(zwRegex, '')].length;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

