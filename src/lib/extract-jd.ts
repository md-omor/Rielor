/**
 * UNIVERSAL JOB DESCRIPTION EXTRACTOR
 * 
 * This module provides a unified interface for extracting job descriptions from URLs.
 * It uses the new universal extraction pipeline that handles any job URL without site-specific logic.
 * 
 * Legacy Note: This file previously used Jina.ai proxy. Now it uses the universal extractor.
 */

import {
  extractJDFromURLSimple,
  extractJDFromURL as extractUniversal,
  type JDExtractionResult
} from './universal-jd-extractor';

// ============================================================================
// LEGACY ERROR CLASSES (kept for backward compatibility)
// ============================================================================

export class ExtractionAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtractionAccessError';
  }
}

export class ExtractionContentError extends Error {
  extractedLength: number;

  constructor(message: string, extractedLength: number = 0) {
    super(message);
    this.name = 'ExtractionContentError';
    this.extractedLength = extractedLength;
  }
}

// ============================================================================
// TYPE ALIASES (for backward compatibility)
// ============================================================================

export type JDExtractionStatus = 'SUCCESS' | 'RESTRICTED' | 'NOT_A_JOB' | 'EMPTY_OR_ERROR';

// ============================================================================
// STATUS MESSAGE MAPPING
// ============================================================================

export function mapJDExtractionStatusToMessage(status: JDExtractionStatus): string {
  switch (status) {
    case 'RESTRICTED':
      return 'This link appears to be private or requires login. Please paste the job description text manually.';
    case 'NOT_A_JOB':
      return 'We could not detect a job description at this link. Please paste the job description text manually.';
    case 'EMPTY_OR_ERROR':
      return 'We could not access this link right now. Please paste the job description text manually.';
    case 'SUCCESS':
    default:
      return '';
  }
}

// ============================================================================
// MAIN EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extracts job description from URL (throws on failure)
 * @param url - Job posting URL
 * @returns Extracted job description text
 * @throws Error if extraction fails for any reason
 */
export async function extractJDFromURL(url: string): Promise<string> {
  try {
    return await extractJDFromURLSimple(url);
  } catch (error: any) {
    // Map to legacy error types for backward compatibility
    throw new ExtractionContentError(error?.message || 'Extraction failed', 0);
  }
}

/**
 * Extracts job description with detailed metadata
 * @param urlInput - Job posting URL
 * @returns Object with extraction status, text, reason, and metadata
 */
export async function extractJDFromURLWithMeta(
  urlInput: string,
): Promise<{ text: string; status: JDExtractionStatus; message: string; finalUrl: string }> {
  const result: JDExtractionResult = await extractUniversal(urlInput);
  
  // Map universal status to legacy status (NOT_A_JOB_URL -> NOT_A_JOB)
  const legacyStatus: JDExtractionStatus = 
    result.status === 'NOT_A_JOB_URL' ? 'NOT_A_JOB' : result.status;
  
  return {
    text: result.jdText,
    status: legacyStatus,
    message: result.reason || mapJDExtractionStatusToMessage(legacyStatus),
    finalUrl: result.finalUrl,
  };
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

type FetchLike = typeof fetch;

export function __setFetchForTest(impl: FetchLike | null) {
  // This is now a no-op for backward compatibility
  // The universal extractor has its own test injection
  console.warn('[extract-jd] __setFetchForTest is deprecated, use universal-jd-extractor directly');
}

export function __setCallAIForTest(impl: ((prompt: string) => Promise<string>) | null) {
  // This is now a no-op for backward compatibility
  console.warn('[extract-jd] __setCallAIForTest is deprecated');
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { extractJDFromURL as extractJDUniversal } from './universal-jd-extractor';
export type { JDExtractionResult };

