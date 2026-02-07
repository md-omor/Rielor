/**
 * UNIVERSAL JOB DESCRIPTION EXTRACTOR
 * 
 * A site-agnostic extraction pipeline that:
 * 1. Normalizes URLs (LinkedIn, Facebook, etc.)
 * 2. Fetches static HTML with realistic headers
 * 3. Extracts using multiple strategies (JSON-LD, meta tags, semantic HTML, heuristics)
 * 4. Falls back to headless browser for JS-heavy sites
 * 5. Validates job signals using heuristics + AI fallback
 * 6. Returns structured classification (SUCCESS, RESTRICTED, NOT_A_JOB_URL, EMPTY_OR_ERROR)
 */

import chromium from "@sparticuz/chromium-min";
import * as cheerio from 'cheerio';
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
// ============================================================================
// TYPES
// ============================================================================

export type JDExtractionStatus = 'SUCCESS' | 'RESTRICTED' | 'NOT_A_JOB_URL' | 'EMPTY_OR_ERROR';

export interface JDExtractionResult {
  status: JDExtractionStatus;
  jdText: string;
  reason: string;
  finalUrl: string;
  httpStatus: number;
  debug?: {
    stage: string;
    extractedLength: number;
    extractionMethod?: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const FETCH_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 10; // Universal redirect following budget
const MIN_STRONG_SIGNAL_CHARS = 50;
const MIN_WEAK_SIGNAL_CHARS = 100; // Relaxed from 200 to 100
const LENGTH_OVERRIDE_CHARS = 300; // Auto-pass threshold
const DEFAULT_CHROMIUM_PACK_URL = 'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar';

function prependLibraryPath(path: string) {
  if (!path) return;

  const current = process.env.LD_LIBRARY_PATH;
  if (!current) {
    process.env.LD_LIBRARY_PATH = path;
    return;
  }

  const parts = current.split(':');
  if (!parts.includes(path)) {
    process.env.LD_LIBRARY_PATH = [path, ...parts].join(':');
  }
}

async function tryLoadServerlessChromium() {
  if (process.env.VERCEL) {
    const majorNodeVersion = Number(process.versions.node.split('.')[0]);
    const lambdaRuntime = `nodejs${majorNodeVersion}.x`;

    process.env.AWS_EXECUTION_ENV ??= `AWS_Lambda_${lambdaRuntime}`;
    process.env.AWS_LAMBDA_JS_RUNTIME ??= lambdaRuntime;

    const preferredLibPath = majorNodeVersion >= 20 ? "/tmp/al2023/lib" : "/tmp/al2/lib";
    prependLibraryPath(preferredLibPath);
  }

  try {
    const chromiumModule = await import("@sparticuz/chromium-min");
    console.log("[Universal Extractor] Using @sparticuz/chromium-min runtime.");
    return chromiumModule.default ?? chromiumModule;
  } catch (e: any) {
    const msg = e?.message || "";
    if (e?.code === "ERR_MODULE_NOT_FOUND" || msg.includes("Cannot find package")) {
      console.warn("[Universal Extractor] @sparticuz/chromium-min not installed.");
      return null;
    }
    throw e;
  }
}



// Job-specific keywords for heuristic validation
const JOB_KEYWORDS = [
  'responsibilities', 'qualifications', 'requirements', 'required',
  'salary', 'benefits', 'experience', 'apply', 'candidate',
  'remote', 'full-time', 'part-time', 'contract', 'position',
  'skills', 'education', 'degree', 'location', 'hybrid'
];

// Login wall detection phrases
const LOGIN_PHRASES = [
  'sign in to view', 'login required', 'members only',
  'create account', 'join to see', 'you must be logged in',
  'please log in', 'authentication required', 'access denied'
];

// ============================================================================
// DEPENDENCY INJECTION (for testing)
// ============================================================================

type FetchLike = typeof fetch;
let fetchImpl: FetchLike = (...args) => fetch(...args);

export function __setFetchForTest(impl: FetchLike | null) {
  fetchImpl = impl ?? ((...args) => fetch(...args));
}

// ============================================================================
// STAGE 1: URL NORMALIZATION & REDIRECT FOLLOWING
// ============================================================================

/**
 * Follows redirects to get final destination URL (universal, not site-specific)
 */
async function followRedirects(url: string, maxHops = MAX_REDIRECTS): Promise<string> {
  try {
    console.log(`[Universal Extractor] Following redirects for: ${url}`);
    
    const response = await fetchImpl(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });
    
    const finalUrl = response.url;
    if (finalUrl !== url) {
      console.log(`[Universal Extractor] Redirect resolved: ${url} → ${finalUrl}`);
    }
    
    return finalUrl;
  } catch (error: any) {
    console.warn('[Universal Extractor] Redirect following failed:', error?.message);
    return url; // Return original URL if redirect fails
  }
}

/**
 * Normalizes job URLs to canonical format and detects feed/search pages
 */
export function normalizeJobUrl(url: string): { normalizedUrl: string; isFeed: boolean } {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();

    // LinkedIn Normalization
    if (host.includes('linkedin.com')) {
      // Extract job ID from various LinkedIn URL patterns
      const jobId = urlObj.searchParams.get('currentJobId') || 
                    urlObj.pathname.match(/\/view\/(\d+)/)?.[1];
      
      if (jobId) {
        return { 
          normalizedUrl: `https://www.linkedin.com/jobs/view/${jobId}/`, 
          isFeed: false 
        };
      }

      // Detect LinkedIn feed/search pages
      if (path.includes('/jobs/collections') || 
          path.includes('/jobs/search') ||
          urlObj.search.includes('keywords=')) {
        return { normalizedUrl: url, isFeed: true };
      }
    }

    // Facebook Normalization
    if (host.includes('facebook.com')) {
      const postId = urlObj.pathname.match(/\/posts\/(\d+)/)?.[1] || 
                     urlObj.searchParams.get('id');
      
      if (postId) {
        return { 
          normalizedUrl: `https://www.facebook.com/posts/${postId}/`, 
          isFeed: false 
        };
      }

      // Facebook group feeds
      if (path.includes('/groups') && !postId) {
        return { normalizedUrl: url, isFeed: true };
      }
    }

    // Indeed feed detection
    if (host.includes('indeed.com')) {
      if (urlObj.search.includes('q=') || path === '/jobs' || path === '/') {
        return { normalizedUrl: url, isFeed: true };
      }
    }

    // Generic job board feed detection
    const feedIndicators = ['search', 'browse', 'all-jobs', 'job-search'];
    if (feedIndicators.some(indicator => path.includes(indicator))) {
      return { normalizedUrl: url, isFeed: true };
    }

    return { normalizedUrl: url, isFeed: false };
  } catch (e) {
    console.error('[Universal Extractor] URL normalization error:', e);
    return { normalizedUrl: url, isFeed: false };
  }
}

// ============================================================================
// STAGE 2: STATIC HTML FETCH
// ============================================================================

/**
 * Fetches HTML with realistic browser headers
 */
async function fetchHTML(url: string): Promise<{ html: string; status: number; finalUrl: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const html = await response.text();
    return { 
      html, 
      status: response.status, 
      finalUrl: response.url 
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('[Universal Extractor] Fetch error:', error?.message || error);
    return { html: '', status: 0, finalUrl: url };
  }
}

// ============================================================================
// STAGE 3: MULTI-STRATEGY CHEERIO EXTRACTION
// ============================================================================

/**
 * Cleans and normalizes extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')         // Strip ALL HTML tags
    .replace(/&nbsp;/g, ' ')         // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')            // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')      // Max 2 newlines
    .trim();
}

/**
 * Strategy 1: Extract from JSON-LD JobPosting schema
 */
function extractFromJSONLD($: cheerio.CheerioAPI): string | null {
  try {
    const scripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html();
      if (!scriptContent) continue;

      const json = JSON.parse(scriptContent);
      const jobPosting = Array.isArray(json) 
        ? json.find((item: any) => item['@type'] === 'JobPosting')
        : json['@type'] === 'JobPosting' ? json : null;

      if (jobPosting) {
        const parts: string[] = [];
        
        if (jobPosting.title) parts.push(`Job Title: ${jobPosting.title}`);
        if (jobPosting.hiringOrganization?.name) parts.push(`Company: ${jobPosting.hiringOrganization.name}`);
        if (jobPosting.description) parts.push(`\nDescription:\n${jobPosting.description}`);
        if (jobPosting.responsibilities) parts.push(`\nResponsibilities:\n${jobPosting.responsibilities}`);
        if (jobPosting.qualifications) parts.push(`\nQualifications:\n${jobPosting.qualifications}`);
        if (jobPosting.skills) parts.push(`\nSkills: ${jobPosting.skills}`);

        return cleanText(parts.join('\n'));
      }
    }
  } catch (e) {
    console.warn('[Universal Extractor] JSON-LD parsing error:', e);
  }
  return null;
}

/**
 * Strategy 2: Extract from meta tags
 */
function extractFromMetaTags($: cheerio.CheerioAPI): string | null {
  const metaDescriptions = [
    $('meta[property="og:description"]').attr('content'),
    $('meta[name="description"]').attr('content'),
    $('meta[name="twitter:description"]').attr('content'),
  ];

  for (const desc of metaDescriptions) {
    if (desc && desc.length > MIN_WEAK_SIGNAL_CHARS) {
      return cleanText(desc);
    }
  }
  return null;
}

/**
 * Strategy 3: Extract from semantic HTML elements
 */
function extractFromSemanticHTML($: cheerio.CheerioAPI): string | null {
  const semanticSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.job-description',
    '#job-description',
    '.description',
  ];

  for (const selector of semanticSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      // Remove scripts, styles, nav, footer
      element.find('script, style, nav, footer, .navigation').remove();
      const text = element.text();
      if (text.length > MIN_WEAK_SIGNAL_CHARS) {
        return cleanText(text);
      }
    }
  }
  return null;
}

/**
 * Strategy 4: Heuristic - find largest text block
 */
function extractLargestTextBlock($: cheerio.CheerioAPI): string | null {
  let largestText = '';
  let maxLength = 0;

  // Remove noise elements
  $('script, style, nav, header, footer, aside, .navigation, .menu, .sidebar').remove();

  // Find largest content block
  $('div, section, article').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text.length > maxLength && text.length > MIN_WEAK_SIGNAL_CHARS) {
      maxLength = text.length;
      largestText = text;
    }
  });

  return largestText ? cleanText(largestText) : null;
}

/**
 * Runs ALL extraction strategies and picks best result by priority
 */
function extractWithCheerio(html: string): { text: string; method: string } | null {
  const $ = cheerio.load(html);

  // Define strategies with priority (higher = better)
  const strategies = [
    { fn: () => extractFromJSONLD($), priority: 4, name: 'json-ld' },
    { fn: () => extractFromSemanticHTML($), priority: 3, name: 'semantic-html' },
    { fn: () => extractLargestTextBlock($), priority: 2, name: 'heuristic' }, // Higher priority than meta
    { fn: () => extractFromMetaTags($), priority: 1, name: 'meta-tags' }
  ];

  // Try ALL strategies and collect results
  const results = strategies
    .map(strategy => ({
      text: strategy.fn(),
      method: strategy.name,
      priority: strategy.priority
    }))
    .filter(result => result.text && result.text.length > 50)
    .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

  // Return best result (highest priority)
  if (results.length > 0) {
    const best = results[0];
    console.log(`[Universal Extractor] ✓ Extracted via ${best.method} (tried ${strategies.length} strategies, got ${results.length} results)`);
    return { text: best.text!, method: best.method };
  }

  return null;
}

// ============================================================================
// STAGE 4: HEADLESS BROWSER FALLBACK
// ============================================================================

/**
 * Checks if HTML contains script tags (indicates JS rendering needed)
 */
function hasScriptTags(html: string): boolean {
  return html.includes('<script');
}



/**
 * Renders page with headless browser and extracts content
 */
/**
 * Robust browser launcher for both Local and Vercel environments
 */
// async function getBrowser() {
//   const isVercel = !!process.env.VERCEL || !!process.env.AWS_EXECUTION_ENV;

//   try {
//     if (isVercel) {
//       console.log('[Universal Extractor] Vercel environment detected, using @sparticuz/chromium-min');
//       const sparticuzChromium = require('@sparticuz/chromium-min');

//       return await puppeteer.launch({
//         args: sparticuzChromium.args,
//         defaultViewport: sparticuzChromium.defaultViewport,
//         executablePath: await sparticuzChromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
//         headless: sparticuzChromium.headless,
//       });
//     }
//   } catch (e: any) {
//     console.error('[Universal Extractor] Chromium launch failed:', e?.message);
//     if (isVercel) {
//       throw new Error(`Failed to launch Chromium on Vercel: ${e?.message}`);
//     }
//     console.warn('[Universal Extractor] Falling back to standard launch');
//   }

//   console.log('[Universal Extractor] Using standard puppeteer launch');
  
//   // Try to find local chrome on Windows
//   let executablePath;
//   if (process.platform === 'win32') {
//     const fs = require('fs');
//     const paths = [
//       'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//       'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
//       'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
//       'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
//       (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
//       (process.env.LOCALAPPDATA || '') + '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
//     ];
//     executablePath = paths.find(p => p && fs.existsSync(p));
//   }

//   return await puppeteer.launch({
//     headless: true,
//     executablePath,
//     args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
//   });
// }


function getRemoteBrowserWSEndpoint() {
  return process.env.PUPPETEER_WS_ENDPOINT || process.env.BROWSER_WS_ENDPOINT || process.env.BROWSERLESS_WS_ENDPOINT;
}


/**
 * Robust browser launcher for both Local and Vercel environments
 */
async function getBrowser() {
  const wsEndpoint = getRemoteBrowserWSEndpoint();
  if (wsEndpoint) {
    console.log("[Universal Extractor] Using remote browser WebSocket endpoint.");
    return await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  }

  const isVercel = !!process.env.VERCEL;

   if (process.env.VERCEL) {
    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }
  

  //   const chromium = await tryLoadServerlessChromium();
  //   if (!chromium) {
  //     throw new Error("chromium-min not available.");
  //   }

  //   const chromiumPackUrl =
  //     process.env.CHROMIUM_PACK_URL ||
  //     "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

  //   // Always use pack URL on Vercel (most reliable for chromium-min)
  //   const executablePath = await chromium.executablePath(chromiumPackUrl);

  //   return await puppeteer.launch({
  //     args: chromium.args,
  //     defaultViewport: chromium.defaultViewport,
  //     executablePath,
  //     headless: chromium.headless,
  //   });
  // }

  // local dev
  const executablePath = await getLocalChromePath();
  if (!executablePath) throw new Error("Local Chrome not found.");
  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}



/**
 * Renders page with headless browser and extracts content
 */
async function extractWithHeadless(url: string): Promise<{ text: string; method: string } | null> {
  let browser;
  try {
    console.log('[Universal Extractor] Launching headless browser...');
    
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    // Block images, media, fonts for speed
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Navigate with timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: FETCH_TIMEOUT_MS 
    });

    // Wait for potential dynamic content (using native setTimeout or waitForTimeout if available in older puppets)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get rendered HTML
    const html = await page.content();
    await browser.close();

    // Re-run cheerio extraction on rendered HTML
    const result = extractWithCheerio(html);
    if (result) {
      return { text: result.text, method: `headless-${result.method}` };
    }

    return null;
  } catch (error: any) {
    console.error('[Universal Extractor] Headless browser error:', error?.message || error);
    if (browser) await browser.close();
    return null;
  }
}

// ============================================================================
// STAGE 5: JOB SIGNAL VALIDATION (HEURISTICS)
// ============================================================================

/**
 * Counts job-related keywords in text
 */
function countJobKeywords(text: string): number {
  const textLower = text.toLowerCase();
  return JOB_KEYWORDS.filter(keyword => textLower.includes(keyword)).length;
}

/**
 * Validates if text has strong job signals (heuristic-based)
 */
function hasStrongJobSignal(text: string): boolean {
  if (!text || text.length < MIN_STRONG_SIGNAL_CHARS) return false;
  
  const keywordCount = countJobKeywords(text);
  
  const rule1 = keywordCount >= 2 && text.length >= MIN_STRONG_SIGNAL_CHARS;
  const rule2 = keywordCount >= 1 && text.length >= LENGTH_OVERRIDE_CHARS;
  
  console.log(`[Validation Debug] Length: ${text.length}, Keywords: ${keywordCount}`);
  console.log(`[Validation Debug] Rule1 (2+ keywords, 50+ chars): ${rule1}`);
  console.log(`[Validation Debug] Rule2 (1+ keyword, 300+ chars): ${rule2}`);
  console.log(`[Validation Debug] Result: ${rule1 || rule2}`);
  
  // Strong signal: 2+ keywords + 50+ chars (relaxed from 3+)
  // OR length override: 300+ chars + 1+ keyword (auto-pass for long content)
  return rule1 || rule2;
}

/**
 * Checks if text has weak job signals (needs AI validation)
 */
function hasWeakJobSignal(text: string): boolean {
  if (!text || text.length < MIN_WEAK_SIGNAL_CHARS) return false;
  
  const keywordCount = countJobKeywords(text);
  
  // Weak signal: 1 keyword + 100+ chars (relaxed from 200+)
  // Exclude if already strong signal
  return keywordCount >= 1 && text.length >= MIN_WEAK_SIGNAL_CHARS && !hasStrongJobSignal(text);
}

// ============================================================================
// STAGE 6: AI VALIDATION FALLBACK (GROQ)
// ============================================================================

/**
 * Uses AI to validate if text is a job description (Groq)
 */
async function validateWithAI(text: string): Promise<boolean> {
  try {
    // Check if Groq API is available
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('[Universal Extractor] GROQ_API_KEY not set, defaulting to FALSE');
      return false;
    }

    // Limit text size for API
    const maxChars = 3000;
    const snippet = text.length > maxChars ? text.slice(0, maxChars) + '...' : text;

const prompt = `You are a job posting validator. Analyze this text and determine if it's a REAL job description/job posting.

RESPOND WITH ONLY "YES" OR "NO" FOLLOWED BY A SHORT REASON.

CRITICAL INSTRUCTION:
Many public job pages have login banners, "Sign in", or "Join now" overlays.
IGNORE these login prompts IF the text also contains specific job details.

A valid job posting MUST have:
- Job title (e.g., "Game Developer", "Sales Manager")
- Specific responsibilities or requirements
- Company name or details

Return "NO" ONLY if:
- It is PURELY a login page / error page / short snippet
- It contains NO specific job duties
- It is just a list of links or navigation

Text to analyze:
${snippet}

Answer (YES/NO + reason):`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.warn('[Universal Extractor] Groq API error:', response.status);
      return false;
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log('[Universal Extractor] AI validation result:', answer);
    return answer.toLowerCase().startsWith('yes');
  } catch (error: any) {
    console.error('[Universal Extractor] AI validation error:', error?.message || error);
    return false;
  }
}

// ============================================================================
// STAGE 7: LOGIN WALL DETECTION
// ============================================================================

/**
 * Detects if page requires login/authentication
 */
function detectLoginWall(html: string, text: string): boolean {
  const combinedText = (html + ' ' + text).toLowerCase();
  return LOGIN_PHRASES.some(phrase => combinedText.includes(phrase));
}

// ============================================================================
// MAIN EXTRACTION PIPELINE
// ============================================================================

/**
 * Main entry point: Extracts JD from URL with structured response
 * STRATEGY: Headless browser for ALL URLs (Option A)
 */
export async function extractJDFromURL(url: string): Promise<JDExtractionResult> {
  console.log(`[Universal Extractor] Starting extraction for: ${url}`);
  
  // Stage 0: Pre-Normalization (Catch IDs before redirects lose them)
  // This helps with LinkedIn 'currentJobId' which redirects to authwall immediately
  const { normalizedUrl: preNormalizedUrl, isFeed: preIsFeed } = normalizeJobUrl(url);
  
  // If pre-normalization found a SPECIFIC job URL (different from input), use it priority
  // This avoids following redirects to login pages when we already have a valid ID
  let targetUrl = url;
  if (preNormalizedUrl !== url && !preIsFeed) {
    console.log(`[Universal Extractor] ✓ Pre-normalized URL (skipping redirects): ${preNormalizedUrl}`);
    targetUrl = preNormalizedUrl;
  } else {
    // Only follow redirects if pre-normalization didn't find a canonical ID
    targetUrl = await followRedirects(url);
  }
  
  // Stage 1: Final Normalization (in case we followed a shortlink)
  const { normalizedUrl, isFeed } = normalizeJobUrl(targetUrl);
  
  if (isFeed) {
    console.log('[Universal Extractor] ✗ Detected feed/search page');
    return {
      status: 'NOT_A_JOB_URL',
      jdText: '',
      reason: 'URL appears to be a job feed or search results page',
      finalUrl: normalizedUrl,
      httpStatus: 200,
      debug: { stage: 'url_normalization', extractedLength: 0 }
    };
  }

  // Stage 2: HEADLESS BROWSER EXTRACTION (Primary Strategy - Option A)
  console.log('[Universal Extractor] Using headless browser for extraction...');
  const extractionResult = await extractWithHeadless(normalizedUrl);
  
  // No content extracted at all
  if (!extractionResult || !extractionResult.text) {
    console.log('[Universal Extractor] ✗ No content extracted via headless browser');
    
    // Try static fetch as last resort (just to check for login wall)
    const { html, status: httpStatus } = await fetchHTML(normalizedUrl);
    
    if (detectLoginWall(html, '')) {
      return {
        status: 'RESTRICTED',
        jdText: '',
        reason: 'Login wall detected; page requires authentication',
        finalUrl: normalizedUrl,
        httpStatus,
        debug: { stage: 'login_detection', extractedLength: 0 }
      };
    }

    return {
      status: 'EMPTY_OR_ERROR',
      jdText: '',
      reason: 'Could not extract content from page',
      finalUrl: normalizedUrl,
      httpStatus: httpStatus || 0,
      debug: { stage: 'headless_extraction_failed', extractedLength: 0 }
    };
  }

  const { text, method } = extractionResult;
  console.log(`[Universal Extractor] Extracted ${text.length} chars via ${method}`);

  // Stage 3: AI Validation (Groq) - Determine if it's a job posting
  console.log('[Universal Extractor] Validating content with AI...');
  const isValidJob = await validateWithAI(text);
  
  if (isValidJob) {
    console.log('[Universal Extractor] ✓ AI confirmed job posting');
    return {
      status: 'SUCCESS',
      jdText: text,
      reason: `Extracted via ${method}, validated with AI`,
      finalUrl: normalizedUrl,
      httpStatus: 200,
      debug: { stage: 'ai_validation', extractedLength: text.length, extractionMethod: method }
    };
  }

  // AI rejected - check if it's a login wall
  console.log('[Universal Extractor] ✗ AI rejected content as non-job');
  
  const { html } = await fetchHTML(normalizedUrl);
  if (detectLoginWall(html, text)) {
    return {
      status: 'RESTRICTED',
      jdText: '',
      reason: 'Login wall detected; page requires authentication',
      finalUrl: normalizedUrl,
      httpStatus: 200,
      debug: { stage: 'login_detection_deferred', extractedLength: text.length, extractionMethod: method }
    };
  }
  
  return {
    status: 'NOT_A_JOB_URL',
    jdText: '',
    reason: 'Extracted content does not appear to be a job description',
    finalUrl: normalizedUrl,
    httpStatus: 200,
    debug: { stage: 'ai_validation_failed', extractedLength: text.length, extractionMethod: method }
  };
}

/**
 * Simplified interface that throws on non-SUCCESS (backward compatible)
 */
export async function extractJDFromURLSimple(url: string): Promise<string> {
  const result = await extractJDFromURL(url);
  
  if (result.status !== 'SUCCESS') {
    throw new Error(result.reason);
  }
  
  return result.jdText;
}
/**
 * Finds local Chrome/Brave executable in standard locations
 */
async function getLocalChromePath(): Promise<string | undefined> {
  const platform = process.platform;
  
  if (platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    ];
    return paths.find(p => fs.existsSync(p));
  }
  
  if (platform === 'darwin') {
    const paths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ];
    return paths.find(p => fs.existsSync(p));
  }
  
  if (platform === 'linux') {
    const paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/brave-browser',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
    return paths.find(p => fs.existsSync(p));
  }
  
  return undefined;
}
