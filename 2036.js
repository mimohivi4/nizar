const CONFIG = {
// URL parameter names (kept for backward compatibility but more descriptive)
PARAMS: {
ARTICLE_ID: 'kj8', // Main article identifier
ALTERNATE_ID: 'io0', // Alternate article identifier
VIDEO_MODE: 'video', // Force video mode
DEBUG_MODE: 'dbg123', // Debug mode toggle
REDIRECT_URL: 'red', // Custom redirect URL
SEARCH_QUERY: 'q' // Search query parameter
},

// Server endpoints
ENDPOINTS: {
API_BASE: 'https://get.hsdpro.com/api/latest/',
DATA_BASE: 'https://get.hsdpro.com/fetch/',
REDIRECT_BASE: '/go/',
API_LATEST: 'https://get.hsdpro.com/api/latest/',
FETCH_DATA: 'https://get.hsdpro.com/fetch/',
REDIRECT_GO: '/go/'
},

// SEO and performance settings
SEO: {
MAX_TITLE_LENGTH: 60,
MAX_DESCRIPTION_LENGTH: 160,
MAX_IMAGE_DIMENSION: 1200,
PRELOAD_PRIORITY: ['critical', 'important'],
DEFER_PRIORITY: ['analytics', 'social']
},

// Schema types
SCHEMA_TYPES: {
ARTICLE: 'Article',
BLOG_POST: 'BlogPosting',
WEB_PAGE: 'WebPage',
PRODUCT: 'Product',
REVIEW: 'Review',
VIDEO_OBJECT: 'VideoObject'
}
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
// SEO and crawling state
crawlerDetected: false,
isCrawlable: true,
lastCrawlTime: null,
crawlBudget: 10, // Estimated number
currentPageViews: 0,

// Article state
article: {
id: null,
data: null,
meta: null,
schemas: [],
loaded: false,
renderTime: 0,
cacheKey: null
},

// Performance state
performance: {
domReadyTime: 0,
loadTime: 0,
firstContentfulPaint: null,
largestContentfulPaint: null,
cumulativeLayoutShift: null,
firstInputDelay: null,
isSlowConnection: false,
cacheHitRatio: 0
},

// User interaction state
interactions: {
scrollDepth: 0,
timeOnPage: 0,
clickCount: 0,
lastAction: null,
abandonedAt: null
},

// Technical state
technical: {
userAgent: '',
connectionType: 'unknown',
screenWidth: 0,
screenHeight: 0,
viewportWidth: 0,
viewportHeight: 0,
supportsWebP: false,
supportsIntersectionObserver: false,
supportsServiceWorker: false,
isMobile: false,
isTablet: false,
isDesktop: false,
language: 'en',
timezone: 'UTC'
}
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function initialize() {
// Set current date for SEO
const currentDate = new Date();
const dateOptions = {
year: 'numeric',
month: 'long',
day: 'numeric',
hour: '2-digit',
minute: '2-digit',
timeZone: 'UTC'
};

// Detect technical capabilities
detectTechnicalCapabilities();

// Parse URL parameters
parseURLParameters();

// Set up monitoring
setupPerformanceMonitoring();

// Initialize meta tags
setupMetaTags();

// Handle initial page load
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
DOMReady();
});
} else {
DOMReady();
}
}

// ============================================================================
// TECHNICAL CAPABILITY DETECTION
// ============================================================================

function detectTechnicalCapabilities() {
const userAgent = navigator.userAgent.toLowerCase();
const connection = navigator.connection || navigator.mozConnection || {};

// Detect crawler/bot
state.crawlerDetected = CONFIG.CRAWLER_UA_PATTERN.test(userAgent);
state.isCrawlable = !state.crawlerDetected;

// Device detection
state.technical.isMobile = /mobile|iphone|ipad|ipod|android|blackberry|windows phone/i.test(userAgent);
state.technical.isTablet = /tablet|ipad|kindle/i.test(userAgent);
state.technical.isDesktop = !state.technical.isMobile && !state.technical.isTablet;

// Connection quality
state.technical.connectionType = connection.effectiveType || connection.type || 'unknown';
state.performance.isSlowConnection = state.technical.connectionType === '4g' ||
state.technical.connectionType === 'slow-2g' ||
(connection.downlink && connection.downlink < 1.5);

// Screen and viewport
state.technical.screenWidth = window.screen.width;
state.technical.screenHeight = window.screen.height;
state.technical.viewportWidth = window.innerWidth;
state.technical.viewportHeight = window.innerHeight;

// Language and timezone
state.technical.language = navigator.language || navigator.userLanguage || 'en';
state.technical.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Modern web features
state.technical.supportsWebP = checkWebPSupport();
state.technical.supportsIntersectionObserver = 'IntersectionObserver' in window;
state.technical.supportsServiceWorker = 'serviceWorker' in navigator;

// Log detection for analytics
console.log('Technical capabilities detected:', {
crawler: state.crawlerDetected,
device: state.technical.isMobile ? 'mobile' : (state.technical.isTablet ? 'tablet' : 'desktop'),
connection: state.technical.connectionType,
viewport: `${state.technical.viewportWidth}x${state.technical.viewportHeight}`,
features: {
webp: state.technical.supportsWebP,
intersectionObserver: state.technical.supportsIntersectionObserver,
serviceWorker: state.technical.supportsServiceWorker
}
});
}

// ============================================================================
// URL PARAMETER PARSING
// ============================================================================

function parseURLParameters() {
const urlParams = new URLSearchParams(window.location.search);

// Article identifier
if (urlParams.has(CONFIG.PARAMS.ARTICLE_ID)) {
state.article.id = urlParams.get(CONFIG.PARAMS.ARTICLE_ID);
} else if (urlParams.has(CONFIG.PARAMS.ALTERNATE_ID)) {
state.article.id = urlParams.get(CONFIG.PARAMS.ALTERNATE_ID);
}

// Mode flags
if (urlParams.has(CONFIG.PARAMS.VIDEO_MODE)) {
state.article.isVideo = true;
}

// Debug mode
if (urlParams.has(CONFIG.PARAMS.DEBUG_MODE)) {
state.debug = true;
}

// Custom redirect URL
if (urlParams.has(CONFIG.PARAMS.REDIRECT_URL)) {
state.redirectUrl = urlParams.get(CONFIG.PARAMS.REDIRECT_URL);
}

// Search query
if (urlParams.has(CONFIG.PARAMS.SEARCH_QUERY)) {
state.searchQuery = urlParams.get(CONFIG.PARAMS.SEARCH_QUERY);
}

console.log('URL parameters parsed:', {
articleId: state.article.id,
isVideo: state.article.isVideo,
debug: state.debug,
redirectUrl: state.redirectUrl,
searchQuery: state.searchQuery,
crawlerDetected: state.crawlerDetected
});
}

// ============================================================================ 'use strict';

const CONFIG = {
// URL parameter names for backward compatibility
PARAMS: {
ARTICLE_ID: 'kj8',
ALTERNATE_ID: 'io0',
VIDEO_MODE: 'video',
DEBUG_MODE: 'dbg123',
REDIRECT_URL: 'red',
SEARCH_QUERY: 'q'
},

// Server endpoints
ENDPOINTS: {
API_BASE: '/api/latest/',
DATA_BASE: '/fetch/',
REDIRECT_BASE: '/go/',
API_LATEST: '/api/latest/',
FETCH_DATA: '/fetch/',
REDIRECT_GO: '/go/'
},

// SEO and performance settings
SEO: {
MAX_TITLE_LENGTH: 60,
MAX_DESCRIPTION_LENGTH: 160,
MAX_IMAGE_DIMENSION: 1200,
PRELOAD_PRIORITY: ['critical', 'important'],
DEFER_PRIORITY: ['analytics', 'social']
},

// Schema types
SCHEMA_TYPES: {
ARTICLE: 'Article',
BLOG_POST: 'BlogPosting',
WEB_PAGE: 'WebPage',
PRODUCT: 'Product',
REVIEW: 'Review',
VIDEO_OBJECT: 'VideoObject'
}
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
// SEO and crawling state
crawlerDetected: false,
isCrawlable: true,
lastCrawlTime: null,
crawlBudget: 10,
currentPageViews: 0,

// Article state
article: {
id: null,
data: null,
meta: null,
schemas: [],
loaded: false,
renderTime: 0,
cacheKey: null
},

// Performance state
performance: {
domReadyTime: 0,
loadTime: 0,
firstContentfulPaint: null,
largestContentiacHeight: null,
cumulativeLayoutShift: null,
firstInputDelay: null,
isSlowConnection: false,
cacheHitRatio: 0
},

// User interaction state
interactions: {
scrollDepth: 0,
timeOnPage: 0,
clickCount: 0,
lastAction: null,
abandonedAt: null
},

// Technical state
technical: {
userAgent: '',
connectionType: 'unknown',
screenWidth: 0,
screenHeight: 0,
viewportWidth: 0,
viewportHeight: 0,
supportsWebP: false,
supportsIntersectionObserver: false,
supportsServiceWorker: false,
isMobile: false,
isTablet: false,
isDesktop: false,
language: 'en',
timezone: 'UTC'
}
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function initialize() {
const currentDate = new Date();
const dateOptions = {
year: 'numeric',
month: 'long',
day: 'numeric',
hour: '2-digit',
minute: '2-digit',
timeZone: 'UTC'
};

detectTechnicalCapabilities();
parseURLParameters();
setupPerformanceMonitoring();
setupMetaTags();

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => DOMReady());
} else {
DOMReady();
}
}

// ============================================================================
// TECHNICAL CAPABILITY DETECTION
// ============================================================================

function detectTechnicalCapabilities() {
const userAgent = navigator.userAgent.toLowerCase();
const connection = navigator.connection || navigator.mozConnection || {};

// Detect crawler/bot
state.crawlerDetected = CONFIG.CRAWLER_UA_PATTERN.test(userAgent);
state.isCrawlable = !state.crawlerDetected;

// Device detection
state.technical.isMobile = /mobile|iphone|ipad|ipod|android|blackberry|windows phone/i.test(userAgent);
state.technical.isTablet = /tablet|ipad|kindle/i.test(userAgent);
state.technical.isDesktop = !state.technical.isMobile && !state.technical.isTablet;

// Connection quality
state.technical.connectionType = connection.effectiveType || connection.type || 'unknown';
state.performance.isSlowConnection = state.technical.connectionType === '4g' ||
state.technical.connectionType === 'slow-2g' ||
(connection.downlink && connection.downlink < 1.5);

// Screen and viewport
state.technical.screenWidth = window.screen.width;
state.technical.screenHeight = window.screen.height;
state.technical.viewportWidth = window.innerWidth;
state.technical.viewportHeight = window.innerHeight;

// Language and timezone
state.technical.language = navigator.language || navigator.userLanguage || 'en';
state.technical.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Modern web features
state.technical.supportsWebP = checkWebPSupport();
state.technical.supportsIntersectionObserver = 'IntersectionObserver' in window;
state.technical.supportsServiceWorker = 'serviceWorker' in navigator;

console.log('Technical capabilities detected:', {
crawler: state.crawlerDetected,
device: state.technical.isMobile ? 'mobile' : (state.technical.isTablet ? 'tablet' : 'desktop'),
connection: state.technical.connectionType,
viewport: `${state.technical.viewportWidth}x${state.technical.viewportHeight}`,
features: {
webp: state.technical.supportsWebP,
intersectionObserver: state.technical.supportsIntersectionObserver,
serviceWorker: state.technical.supportsServiceWorker
}
});
}

// ============================================================================
// URL PARAMETER PARSING
// ============================================================================

function parseURLParameters() {
const urlParams = new URLSearchParams(window.location.search);

// Article identifier
if (urlParams.has(CONFIG.PARAMS.ARTICLE_ID)) {
state.article.id = urlParams.get(CONFIG.PARAMS.ARTICLE_ID);
} else if (urlParams.has(CONFIG.PARAMS.ALTERNATE_ID)) {
state.article.id = urlParams.get(CONFIG.PARAMS.ALTERNATE_ID);
}

// Mode flags
if (urlParams.has(CONFIG.PARAMS.VIDEO_MODE)) {
state.article.isVideo = true;
}

// Debug mode
if (urlParams.has(CONFIG.PARAMS.DEBUG_MODE)) {
state.debug = true;
}

// Custom redirect URL
if (urlParams.has(CONFIG.PARAMS.REDIRECT_URL)) {
state.redirectUrl = urlParams.get(CONFIG.PARAMS.REDIRECT_URL);
}

// Search query
if (urlParams.has(CONFIG.PARAMS.SEARCH_QUERY)) {
state.searchQuery = urlParams.get(CONFIG.PARAMS.SEARCH_QUERY);
}

console.log('URL parameters parsed:', {
articleId: state.article.id,
isVideo: state.article.isVideo,
debug: state.debug,
redirectUrl: state.redirectUrl,
searchQuery: state.searchQuery,
crawlerDetected: state.crawlerDetected
});
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

function setupPerformanceMonitoring() {
// Track DOM ready time
const startTime = performance.now();

// Monitor Core Web Vitals
if ('PerformanceObserver' in window) {
// Largest Contentful Paint
const lcpObserver = new PerformanceObserver((entryList) => {
const entries = entryList.getEntries();
const lastEntry = entries[entries.length - 1];
state.performance.largestContentfulPaint = lastEntry.startTime;

// Log LCP for performance analysis
if (!state.crawlerDetected) {
console.log('LCP:', lastEntry.startTime + 'ms', {
element: lastEntry.element?.tagName,
size: lastEntry.size,
url: lastEntry.url
});
}
});

try {
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
} catch (e) {
console.warn('LCP observer not supported');
}

// Cumulative Layout Shift
const clsObserver = new PerformanceObserver((entryList) => {
const entries = entryList.getEntries();
let clsValue = 0;

for (const entry of entries) {
if (!entry.hadRecentInput) {
clsValue += entry.value;
}
}

state.performance.cumulativeLayoutShift = clsValue;

if (!state.crawlerDetected && clsValue > 0.1) {
console.warn('High CLS:', clsValue, 'entries:', entries.length);
}
});

try {
clsObserver.observe({ type: 'layout-shift', buffered: true });
} catch (e) {
console.warn('CLS observer not supported');
}

// First Input Delay
const fidObserver = new PerformanceObserver((entryList) => {
const entries = entryList.getEntries();
for (const entry of entries) {
state.performance.firstInputDelay = entry.processingStart - entry.startTime;

if (!state.crawlerDetected && entry.processingStart - entry.startTime > 100) {
console.warn('High FID:', entry.processingStart - entry.startTime + 'ms', {
inputType: entry.inputType,
target: entry.target?.tagName
});
}

break; // Only measure first input
}
});

try {
fidObserver.observe({ type: 'first-input', buffered: true });
} catch (e) {
console.warn('FID observer not supported');
}
}

// Track viewport changes for SEO
let lastScrollY = window.scrollY;
let scrollTimer = null;

const handleScroll = () => {
if (state.crawlerDetected) return;

const scrollTop = window.scrollY;
const documentHeight = document.documentElement.scrollHeight;
const viewportHeight = window.innerHeight;
const maxScroll = documentHeight - viewportHeight;

if (maxScroll > 0) {
state.interactions.scrollDepth = Math.min((scrollTop / maxScroll) * 100, 100);
}

// Debounce scroll events
if (scrollTimer) clearTimeout(scrollTimer);
scrollTimer = setTimeout(() => {
state.interactions.lastAction = 'scroll';
state.interactions.scrollDepth = Math.min((scrollTop / maxScroll) * 100, 100);
}, 100);
};

window.addEventListener('scroll', handleScroll, { passive: true });

// Track time on page
let timeOnPageStart = Date.now();

const handleVisibilityChange = () => {
if (document.hidden) {
state.interactions.abandonedAt = Date.now() - timeOnPageStart;
state.interactions.lastAction = 'tab_hidden';
} else {
timeOnPageStart = Date.now();
state.interactions.lastAction = 'tab_visible';
}
};

document.addEventListener('visibilitychange', handleVisibilityChange);

// Track clicks for engagement
const handleClick = (e) => {
if (state.crawlerDetected) return;

const target = e.target;
if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
state.interactions.clickCount++;
state.interactions.lastAction = 'click';
state.interactions.timeOnPage = Date.now() - timeOnPageStart;
}
};

document.addEventListener('click', handleClick, true);

// Set up periodic analytics for crawlers
if (state.crawlerDetected) {
setInterval(() => {
logCrawlerMetrics();
}, 30000); // Every 30 seconds
}
}

// ============================================================================
// WEBP SUPPORT CHECK
// ============================================================================

function checkWebPSupport() {
const canvas = document.createElement('canvas');
return (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
}

// ============================================================================
// META TAG SETUP
// ============================================================================

function setupMetaTags() {
// Create a document fragment for meta tags
const metaFragment = document.createDocumentFragment();

// Basic meta tags
const metaTags = [
{ charset: 'utf-8' },
{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
{ httpEquiv: 'X-UA-Compatible', content: 'IE=edge' },
{ name: 'robots', content: state.isCrawlable ? 'index, follow' : 'noindex, nofollow' },
{ name: 'googlebot', content: state.isCrawlable ? 'index, follow' : 'noindex, nofollow' },
{ name: 'bingbot', content: state.isCrawlable ? 'index,follow' : 'noindex,nofollow' },
{ name: 'author', content: 'HSD Pro Team' },
{ name: 'copyright', content: 'HSD Pro ' + new Date().getFullYear() },
{ name: 'distribution', content: 'global' },
{ name: 'rating', content: 'general' }
];

// Add Open Graph tags
const ogTags = [
{ property: 'og:type', content: state.article.isVideo ? 'video.movie' : 'article' },
{ property: 'og:site_name', content: 'HSD Pro' },
{ property: 'og:locale', content: state.technical.language.replace('-', '_') },
{ property: 'og:image:type', content: 'image/jpeg' },
{ property: 'og:video:type', content: 'video/mp4' },
{ property: 'og:video:width', content: '1280' },
{ property: 'og:video:height', content: '720' }
];

// Add Twitter Card tags
const twitterTags = [
{ name: 'twitter:card', content: state.article.isVideo ? 'player' : 'summary_large_image' },
{ name: 'twitter:site', content: '@hsdpro' },
{ name: 'twitter:creator', content: '@hsdpro' },
{ name: 'twitter:image:src', content: 'https://get.hsdpro.com/images/male-enhancement.jpg' },
{ name: 'twitter:player', content: state.article.isVideo ? 'https://get.hsdpro.com/video/' + state.article.id : null }
];

// Add structured data script tag for crawlers
const structuredDataScript = document.createElement('script');
structuredDataScript.type = 'application/ld+json';
structuredDataScript.id = 'structured-data';
document.head.appendChild(structuredDataScript);

// Create link tags for preconnect and prefetch
createResourceHints();

// Initialize meta tag creation
metaTags.forEach(tag => createMetaTag(tag, metaFragment));
ogTags.forEach(tag => createMetaTag(tag, metaFragment, 'property'));
twitterTags.forEach(tag => createMetaTag(tag, metaFragment));

document.head.appendChild(metaFragment);
}

// ============================================================================
// RESOURCE HINTS FOR SEO
// ============================================================================

function createResourceHints() {
const resources = [
{ rel: 'preconnect', href: 'https://get.hsdpro.com', crossOrigin: 'anonymous' },
{ rel: 'dns-prefetch', href: 'https://get.hsdpro.com' },
{ rel: 'preload', href: '/styles.css', as: 'style' },
{ rel: 'preload', href: '/scripts.js', as: 'script' },
{ rel: 'modulepreload', href: '/module.js', as: 'script' }
];

resources.forEach(resource => {
const link = document.createElement('link');
link.rel = resource.rel;

if (resource.href) link.href = resource.href;
if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
if (resource.as) link.setAttribute('as', resource.as);
if (resource.type) link.type = resource.type;

document.head.appendChild(link);
});
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createMetaTag(tag, fragment, attribute = 'name') {
const meta = document.createElement('meta');

Object.entries(tag).forEach(([key, value]) => {
if (key === attribute) {
if (attribute === 'name' || attribute === 'property') {
meta.setAttribute(key, value);
} else {
meta.name = value;
}
} else if (key === 'charset') {
meta.charset = value;
} else {
meta.setAttribute(key, value);
}
});

fragment.appendChild(meta);
}

function checkWebPSupport() {
const canvas = document.createElement('canvas');
return (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
}

// ============================================================================
// DOM READY HANDLER
// ============================================================================

function DOMReady() {
// Record DOM ready time for performance
state.performance.domReadyTime = performance.now();
state.performance.loadTime = Date.now();

// Log initial metrics for crawlers
if (state.crawlerDetected) {
logCrawlerMetrics();
}

// Initialize main functionality
if (state.crawlerDetected) {
handleCrawler();
} else {
handleUser();
}

// Set up periodic tasks for both crawlers and users
setupPeriodicTasks();

// Set up error handling
setupErrorHandling();

// Set up visibility tracking
setupVisibilityTracking();

console.log('DOM ready - initializing article display:', {
articleId: state.article.id,
crawlerDetected: state.crawlerDetected,
isVideo: state.article.isVideo
});
}

// ============================================================================
// ARTICLE HANDLING
// ============================================================================

function handleCrawler() {
console.log('Crawler mode - setting up lightweight rendering');

// For crawlers, we want to serve lightweight content
// but still maintain all essential structured data

// Set up a simple version for crawlers
setupMetaTags();

// Load meta data for redirection if needed
if (state.article.id) {
loadMeta().then(meta => {
if (meta && meta.redirect && !state.debug) {
console.log('Crawler detected redirect:', meta.to);
redirectTo(meta.to);
}
}).catch(err => {
console.warn('Failed to load meta for crawler:', err);
});
}

// Set up minimal interaction tracking
setupCrawlerTracking();
}

function handleUser() {
console.log('User mode - loading full article content');

// Set up full feature set for users
setupMetaTags();

// Load article data
if (state.article.id) {
loadArticleData();
} else if (!state.debug) {
show404();
}

// Set up full interaction tracking
setupUserTracking();
}

function loadArticleData() {
const dataUrl = CONFIG.ENDPOINTS.FETCH_DATA + state.article.id + CONFIG.FORMAT;

// Try the primary endpoint first
fetch(dataUrl)
.then(response => {
if (!response.ok) {
throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
return response.json();
})
.then(data => {
state.article.data = data;
state.article.loaded = true;
state.article.renderTime = performance.now();

console.log('Article data loaded successfully:', {
id: state.article.id,
title: data.title,
hasVideo: data.isVideo || false
});

// Load meta data
return loadMeta();
})
.then(meta => {
state.article.meta = meta;

// Process schemas
processSchemas(data, meta);

// Render article
renderArticle();

// Set up lazy loading for images
setupLazyLoading();

// Set up share functionality
setupShareFunctionality();
})
.catch(error => {
console.error('Failed to load article data:', error);

if (!state.debug) {
show404();
} else {
console.error('Debug mode: showing error details', error);
showDebugError(error);
}
});
}

function loadMeta() {
return fetch(CONFIG.ENDPOINTS.API_LATEST + state.article.id)
.then(response => {
if (!response.ok) {
throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
return response.json();
})
.then(data => {
console.log('Meta data loaded successfully:', {
id: state.article.id,
redirect: data.redirect,
updated: data.updated
});
return data;
})
.catch(error => {
console.error('Failed to load meta data:', error);
throw error;
});
}

// ============================================================================
// ARTICLE RENDERING
// ============================================================================

function renderArticle() {
if (!state.article.data || !state.article.meta) {
console.error('Cannot render article: missing data or meta');
return;
}

const articleData = state.article.data;
const articleMeta = state.article.meta;

// Update document title
document.title = generateArticleTitle(articleData);

// Set up Open Graph tags
setupOpenGraphTags(articleData, articleMeta);

// Set up Twitter Card tags
setupTwitterCardTags(articleData);

// Set up structured data
setupStructuredData(articleData, articleMeta);

// Render main content
renderArticleContent(articleData);

// Render sidebar
renderSidebar();

// Set up interactive elements
setupInteractiveElements();

// Set up performance monitoring
setupPerformanceMonitoring();

console.log('Article rendered successfully:', {
id: state.article.id,
title: articleData.title,
renderTime: state.article.renderTime
});
}

function generateArticleTitle(articleData) {
let title = articleData.title || 'Untitled Article';

// Truncate title if too long for SEO
if (title.length > CONFIG.SEO.MAX_TITLE_LENGTH) {
title = title.substring(0, CONFIG.SEO.MAX_TITLE_LENGTH - 3) + '...';
}

return title;
}

function setupOpenGraphTags(articleData, articleMeta) {
const ogTags = [
{ property: 'og:title', content: generateArticleTitle(articleData) },
{ property: 'og:description', content: articleData.description || '' },
{ property: 'og:url', content: window.location.href },
{ property: 'og:image', content: articleData.image || 'https://get.hsdpro.com/images/male-enhancement.jpg' },
{ property: 'og:image:secure_url', content: articleData.image || 'https://get.hsdpro.com/images/male-enhancement.jpg' },
{ property: 'og:image:width', content: '1200' },
{ property: 'og:image:height', content: '630' },
{ property: 'og:type', content: articleData.isVideo ? 'video.movie' : 'article' },
{ property: 'og:site_name', content: 'HSD Pro' },
{ property: 'og:locale', content: state.technical.language.replace('-', '_') },
{ property: 'article:published_time', content: articleMeta.updated || new Date().toISOString() },
{ property: 'article:modified_time', content: articleMeta.updated || new Date().toISOString() },
{ property: 'article:section', content: 'Reviews' },
{ property: 'article:tag', content: 'male enhancement' }
];

ogTags.forEach(tag => {
const existingMeta = document.querySelector(`meta[property="${tag.property}"]`);
if (existingMeta) {
existingMeta.content = tag.content;
} else {
const meta = document.createElement('meta');
meta.setAttribute('property', tag.property);
meta.content = tag.content;
document.head.appendChild(meta);
}
});
}

function setupTwitterCardTags(articleData) {
const twitterTags = [
{ name: 'twitter:card', content: articleData.isVideo ? 'player' : 'summary_large_image' },
{ name: 'twitter:site', content: '@hsdpro' },
{ name: 'twitter:creator', content: '@hsdpro' },
{ name: 'twitter:title', content: generateArticleTitle(articleData) },
{ name: 'twitter:description', content: articleData.description || '' },
{ name: 'twitter:image', content: articleData.image || 'https://get.hsdpro.com/images/male-enhancement.jpg' },
{ name: 'twitter:image:alt', content: articleData.title || 'Article image' }
];

twitterTags.forEach(tag => {
const existingMeta = document.querySelector(`meta[name="${tag.name}"]`);
if (existingMeta) {
existingMeta.content = tag.content;
} else {
const meta = document.createElement('meta');
meta.name = tag.name;
meta.content = tag.content;
document.head.appendChild(meta);
}
});
}

function setupStructuredData(articleData, articleMeta) {
// Generate comprehensive structured data
const structuredData = {
'@context': 'https://schema.org',
'@type': 'Article',
headline: generateArticleTitle(articleData),
description: articleData.description || '',
image: articleData.image || 'https://get.hsdpro.com/images/male-enhancement.jpg',
author: {
'@type': 'Organization',
name: 'HSD Pro',
url: window.location.origin
},
publisher: {
'@type': 'Organization',
name: 'HSD Pro',
logo: {
'@type': 'ImageObject',
url: window.location.origin + '/images/logo.png',
width: 512,
height: 512
}
},
datePublished: articleMeta.updated || new Date().toISOString(),
dateModified: articleMeta.updated || new Date().toISOString(),
articleSection: 'Reviews',
keywords: ['male enhancement', 'review', '2026', 'health', 'fitness'],
mainEntityOfPage: {
'@type': 'WebPage',
'@id': window.location.href
},
isAccessibleForFree: true,
copyrightHolder: {
'@type': 'Organization',
name: 'HSD Pro'
},
responsiblePerson: {
'@type': 'Person',
name: 'HSD Pro Team'
}
};

// Add additional schema for review ratings
if (articleData.rate && articleData.votes) {
structuredData.aggregateRating = {
'@type': 'AggregateRating',
ratingValue: articleData.rate,
ratingCount: articleData.votes,
bestRating: '5',
worstRating: '1'
};
}

// Add offer schema
structuredData.offers = {
'@type': 'Offer',
price: '0',
priceCurrency: 'USD',
availability: 'https://schema.org/InStock',
url: articleMeta.redirectUrl || CONFIG.DEFAULT_REDIRECT
};

// Update existing structured data script
const existingScript = document.getElementById('structured-data');
if (existingScript) {
existingScript.textContent = JSON.stringify(structuredData, null, 2);
}
}

// ============================================================================
// LAZY LOADING SETUP
// ============================================================================

function setupLazyLoading() {
if ('IntersectionObserver' in window) {
const imageObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const image = entry.target;

// Load the image
loadImage(image);

// Stop observing once loaded
imageObserver.unobserve(image);
}
});
}, {
rootMargin: '50px 0px',
threshold: 0.01
});

// Find all images that need lazy loading
document.querySelectorAll('img[data-src]').forEach(img => {
imageObserver.observe(img);
});
} else {
// Fallback for browsers without IntersectionObserver
loadAllImages();
}
}

function loadImage(imgElement) {
const src = imgElement.getAttribute('data-src');
if (src) {
imgElement.src = src;
imgElement.removeAttribute('data-src');

// Handle WebP support
if (state.technical.supportsWebP && src.endsWith('.jpg')) {
const webpSrc = src.replace('.jpg', '.webp');
imgElement.setAttribute('data-webp', webpSrc);
}

// Add loaded event handler
imgElement.onload = () => {
imgElement.classList.add('loaded');
};
}
}

function loadAllImages() {
document.querySelectorAll('img[data-src]').forEach(img => {
loadImage(img);
});
}

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================

function setupShareFunctionality() {
// Create share buttons
const shareContainer = document.createElement('div');
shareContainer.className = 'share-container';
shareContainer.innerHTML = `
<div class="share-buttons">
<button class="share-button" onclick="shareToSocial('facebook')" title="Share on Facebook">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-3V7a1 1 0 0 1 1-1h3z"/>
</svg>
Facebook
</button>
<button class="share-button" onclick="shareToSocial('twitter')" title="Share on Twitter">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.6 4.6 0 0 0-7.86 2.3 10.1 10.1 0 0 1-2.83.7A4.9 4.9 0 0 0 3.64 4.59 4.9 4.9 0 0 0 .47 6.7A4.9 4.9 0 0 1 2 8.45v.05A4.9 4.9 0 0 1 2 14.45 14.9a4.9 4.9 0 0 1-7-4.7A4.9 4.9 0 0 1 1 4.9 4.9 0 0 1 2 3.21 10.1a10.1 10.1 0 0 1 11-2.83 4.9 4.9 0 0 1 3.66 6.29 4.9 4.9 0 0 1-2.24 9.47A9 9 0 0 1 2 22a9 9 0 1 1 9-13.9 4.9 4.9 0 0 1 1-7 9.9 9.9 0 0 1-5-8.4z"/>
</svg>
Twitter
</button>
<button class="share-button" onclick="shareToSocial('linkedin')" title="Share on LinkedIn">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
<path d="M20.447 20.448h-3.554v-5.6c0-1.373-1.213-2.4-2.831-2.4-2.771 0-4.444 1.555-4.444 2.755v5.372H9.880V9h3.27v1.445h.048c.458-.869 1.256-1.567 2.433-1.567 2.871 0 5.112 1.872 5.112 5.911v5.372H20.447zM5.337 7.438a2.13 2.13 0 0 1-2.132-2.131A2.13 2.13 0 0 1 3.87.307a2.13 2.13 0 0 1-2.532 2.824H5.337zM3.119 20.448H7.56V9.753H3.119z"/>
</svg>
LinkedIn
</button>
<button class="share-button" onclick="shareToSocial('copy')" title="Copy link">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
<path d="M16 8l2-2m0 0l-8 8-4-4m0 0h12a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4z"/>
</svg>
Copy Link
</button>
</div>
`;

// Add share container to the article header
const articleHeader = document.querySelector('article header');
if (articleHeader) {
articleHeader.appendChild(shareContainer);
}
}

function shareToSocial(platform) {
const url = window.location.href;
const title = document.title;

let shareUrl = '';

switch (platform) {
case 'facebook':
shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
break;
case 'twitter':
shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
break;
case 'linkedin':
shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
break;
case 'copy':
navigator.clipboard.writeText(url).then(() => {
showNotification('Link copied to clipboard!');
}).catch(err => {
console.error('Failed to copy link:', err);
showNotification('Failed to copy link', 'error');
});
return;
}

// Open share window
window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');

// Track share action
logShareEvent(platform);
}

function showNotification(message, type = 'success') {
// Create notification element
const notification = document.createElement('div');
notification.className = `notification ${type}`;
notification.textContent = message;

// Add styles
Object.assign(notification.style, {
position: 'fixed',
bottom: '20px',
left: '50%',
transform: 'translateX(-50%)',
backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
color: 'white',
padding: '12px 24px',
borderRadius: '6px',
zIndex: '9999',
opacity: '0',
transition: 'opacity 0.3s ease'
});

document.body.appendChild(notification);

// Show notification
setTimeout(() => {
notification.style.opacity = '1';
}, 10);

// Hide notification
setTimeout(() => {
notification.style.opacity = '0';
setTimeout(() => {
document.body.removeChild(notification);
}, 300);
}, 3000);
}

function logShareEvent(platform) {
if (state.crawlerDetected) return;

console.log('Share event tracked:', {
platform: platform,
url: window.location.href,
timestamp: Date.now()
});

// Here you would send this data to your analytics service
// For example: analytics.track('share', { platform, url: window.location.href });
}

// ============================================================================
// PERIODIC TASKS
// ============================================================================

function setupPeriodicTasks() {
// Log performance metrics every 30 seconds for users
if (!state.crawlerDetected) {
setInterval(() => {
logPerformanceMetrics();
}, 30000);
}

// Check for abandoned sessions every 5 minutes
setInterval(() => {
checkAbandonedSessions();
}, 300000);

// Update scroll depth
setInterval(() => {
updateScrollDepth();
}, 1000);

// Update time on page
setInterval(() => {
updateTimeOnPage();
}, 1000);
}

function logPerformanceMetrics() {
const performanceData = {
url: window.location.href,
timestamp: Date.now(),
viewport: `${state.technical.viewportWidth}x${state.technical.viewportHeight}`,
loadTime: state.performance.loadTime,
domReadyTime: state.performance.domReadyTime,
largestContentfulPaint: state.performance.largestContentfulPaint,
cumulativeLayoutShift: state.performance.cumulativeLayoutShift,
firstInputDelay: state.performance.firstInputDelay,
isSlowConnection: state.performance.isSlowConnection,
scrollDepth: state.interactions.scrollDepth,
clickCount: state.interactions.clickCount,
timeOnPage: state.interactions.timeOnPage,
lastAction: state.interactions.lastAction
};

console.log('Performance metrics:', performanceData);

// Send to analytics service
// analytics.track('performance', performanceData);
}

function checkAbandonedSessions() {
if (state.interactions.abandonedAt && !state.interactions.timeOnPage) {
state.interactions.timeOnPage = state.interactions.abandonedAt;

const abandonmentData = {
url: window.location.href,
timestamp: Date.now(),
timeOnPage: state.interactions.timeOnPage,
scrollDepth: state.interactions.scrollDepth,
lastAction: state.interactions.lastAction,
abandonedAt: state.interactions.abandonedAt
};

console.log('Abandoned session:', abandonmentData);

// Send to analytics service
// analytics.track('abandonment', abandonmentData);
}
}

function updateScrollDepth() {
const documentHeight = document.documentElement.scrollHeight;
const viewportHeight = window.innerHeight;
const maxScroll = documentHeight - viewportHeight;

if (maxScroll > 0) {
const scrollTop = window.scrollY;
const newScrollDepth = Math.min((scrollTop / maxScroll) * 100, 100);

if (newScrollDepth > state.interactions.scrollDepth) {
state.interactions.scrollDepth = newScrollDepth;
state.interactions.lastAction = 'scroll';
}
}
}

function updateTimeOnPage() {
if (!state.interactions.timeOnPageStart) {
state.interactions.timeOnPageStart = Date.now();
}

state.interactions.timeOnPage = Date.now() - state.interactions.timeOnPageStart;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function setupErrorHandling() {
window.addEventListener('error', (e) => {
if (state.debug) {
console.error('JavaScript error:', {
message: e.message,
filename: e.filename,
lineno: e.lineno,
colno: e.colno,
error: e.error
});
}

// Log error for analytics
if (!state.crawlerDetected) {
logErrorEvent({
message: e.message,
filename: e.filename,
lineno: e.lineno,
colno: e.colno,
stack: e.error?.stack,
url: window.location.href
});
}
});

window.addEventListener('unhandledrejection', (e) => {
if (state.debug) {
console.error('Unhandled rejection:', {
reason: e.reason,
promise: e.promise
});
}

// Log error for analytics
if (!state.crawlerDetected) {
logErrorEvent({
type: 'unhandledrejection',
reason: e.reason,
promise: e.promise,
url: window.location.href
});
}
});
}

function logErrorEvent(errorData) {
console.error('Error logged:', errorData);

// Send to analytics service
// analytics.track('error', errorData);
}

function showDebugError(error) {
const errorContainer = document.createElement('div');
errorContainer.className = 'debug-error';
errorContainer.innerHTML = `
<div style="position: fixed; top: 0; left: 0; right: 0; background: #ff6b6b; color: white; padding: 20px; z-index: 10000; font-family: monospace;">
<h3 style="margin: 0 0 10px 0;">JavaScript Error</h3>
<pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; overflow: auto;">${error.message}</pre>
<details style="margin-top: 10px;">
<summary>Stack Trace</summary>
<pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; overflow: auto; max-height: 200px; overflow-y: auto;">${error.stack || 'No stack trace available'}</pre>
</details>
<button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff6b6b; border: none; border-radius: 4px; cursor: pointer;">Close</button>
</div>
`;

document.body.appendChild(errorContainer);
}

// ============================================================================
// CRWLER LOGGING
// ============================================================================

function logCrawlerMetrics() {
const crawlMetrics = {
url: window.location.href,
timestamp: Date.now(),
userAgent: state.technical.userAgent,
viewport: `${state.technical.viewportWidth}x${state.technical.viewportHeight}`,
pageViews: state.currentPageViews++,
crawlTime: Date.now() - state.lastCrawlTime,
isVideo: state.article.isVideo,
schemaCount: state.article.schemas.length,
hasStructuredData: document.querySelector('#structured-data') !== null,
hasMetaTags: document.querySelector('meta[property="og:title"]') !== null
};

console.log('Crawler metrics:', crawlMetrics);

// Log to analytics service
// analytics.track('crawler_metrics', crawlMetrics);
}

function setupCrawlerTracking() {
// Track page views for crawlers
state.lastCrawlTime = Date.now();

// Monitor for changes in crawl budget
if (state.currentPageViews >= CONFIG.crawlBudget) {
console.log('Crawl budget limit reached:', CONFIG.crawlBudget);
// Consider pausing or stopping crawling
}
}

// ============================================================================
// INTERACTIVE ELEMENTS SETUP
// ============================================================================

function setupInteractiveElements() {
// Add smooth scrolling to all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
e.preventDefault();
const target = document.querySelector(this.getAttribute('href'));
if (target) {
target.scrollIntoView({
behavior: 'smooth',
block: 'start'
});
}
});
});

// Set up mobile menu toggle
const createMobileMenu = () => {
const mobileMenu = document.createElement('button');
mobileMenu.className = 'mobile-menu-toggle';
mobileMenu.innerHTML = '☰ Menu';
mobileMenu.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
z-index: 1000;
padding: 10px 15px;
background: #3b82f6;
color: white;
border: none;
border-radius: 6px;
cursor: pointer;
display: none;
`;

// Show on mobile devices
if (state.technical.isMobile || state.technical.isTablet) {
mobileMenu.style.display = 'block';
}

mobileMenu.addEventListener('click', () => {
const nav = document.querySelector('nav');
if (nav) {
nav.style.display = nav.style.display === 'none' ? 'block' : 'none';
}
});

document.body.appendChild(mobileMenu);
};

createMobileMenu();

// Set up theme toggle if needed
const createThemeToggle = () => {
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '🌙';
themeToggle.style.cssText = `
position: fixed;
bottom: 20px;
right: 20px;
z-index: 1000;
padding: 10px;
background: #374151;
color: white;
border: none;
border-radius: 50%;
width: 50px;
height: 50px;
cursor: pointer;
font-size: 20px;
`;

themeToggle.addEventListener('click', () => {
document.body.classList.toggle('dark-mode');
const icon = themeToggle.textContent === '☀️' ? '🌙' : '☀️';
themeToggle.textContent = icon;
});

document.body.appendChild(themeToggle);
};

createThemeToggle();
}

// ============================================================================
// EXPORTS
// ============================================================================

window.HSDPro = {
CONFIG,
state,
initialize,
handleCrawler,
handleUser,
loadArticleData,
show404,
logShareEvent,
showNotification,
loadMeta,
setupPeriodicTasks
};
