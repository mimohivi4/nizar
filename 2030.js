(function () {
  "use strict";

  /*
   * Article loader adapted to the first script's flow:
   *   ?id=ARTICLE_ID
   *   1) Request redirect metadata from get.hsdpro.com/api/latest/
   *   2) If metadata contains redirectUrl (or redirect + to), redirect.
   *   3) Otherwise load the article from get.hsdpro.com/fetch/
   *
   * Optional: ?video=1 enables the video presentation when the article
   * JSON contains a video URL.
   */

  const PARAM_NAME = "id";
  const API_BASE = "https://get.hsdpro.com";
  const META_URL = API_BASE + "/api/latest/";
  const ARTICLE_URL = API_BASE + "/fetch/";
  const ARTICLE_FORMAT = ".json";

  const params = new URLSearchParams(window.location.search);
  const identifier = params.get(PARAM_NAME) || params.get("kj8") || params.get("io0");
  const isVideo = params.has("video");
  const debug = params.has("debug");
  const root = document.body;

  function requestJson(url) {
    return fetch(url, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("Request failed: " + response.status);
      return response.json();
    });
  }

  function safeText(value) {
    return value == null ? "" : String(value);
  }

  function titleCase(value) {
    return safeText(value).toLowerCase().replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function addMeta(name, content, property) {
    const node = document.createElement("meta");
    node.setAttribute(property ? "property" : "name", name);
    node.setAttribute("content", safeText(content));
    document.head.appendChild(node);
  }

  function addSchema(id, data) {
    const old = document.getElementById(id);
    if (old) old.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      *{box-sizing:border-box}
      body{margin:0;background:#fff;color:#222;font:16px/1.65 Arial,Helvetica,sans-serif}
      .page{width:min(1180px,calc(100% - 32px));margin:32px auto;display:grid;
        grid-template-columns:minmax(0,2fr) minmax(240px,1fr);gap:44px}
      article h1{font-size:clamp(27px,4vw,40px);line-height:1.2;margin:0 0 12px}
      .published{color:#777;font-size:13px;margin:0 0 22px}
      .hero{width:100%;max-height:430px;object-fit:cover;border-radius:5px}
      .caption{text-align:center;color:#777;font-size:13px}
      .article-copy{margin-top:24px;text-align:justify;overflow-wrap:anywhere}
      .cta{display:block;position:relative;margin:30px auto;padding:18px 20px;width:min(560px,100%);
        background:#3985df;color:#fff;text-align:center;text-decoration:none;border-radius:6px;font-weight:bold}
      .cta small{display:block;font-weight:normal}
      .article-copy h2{margin:28px 0 12px;padding:14px;background:#444;color:white;text-align:center}
      aside h2{margin:0;background:#444;color:white;text-align:center;padding:14px;font-size:20px}
      .related-item{position:relative;padding:16px 8px;border-bottom:1px solid #ddd}
      .related-item a{color:#222;text-decoration:none;font-weight:bold;font-size:18px}
      footer{margin:80px 0 30px;color:#777;font-size:12px}
      video{width:100%;max-height:480px;background:#111}
      @media(max-width:760px){.page{grid-template-columns:1fr;gap:28px;margin:20px auto}}
    `;
    document.head.appendChild(style);
  }

  function showError(message) {
    root.innerHTML = "";
    const box = document.createElement("main");
    box.style.cssText = "max-width:760px;margin:12vh auto;padding:24px;font:16px Arial,sans-serif";
    const heading = document.createElement("h1");
    heading.textContent = "Article unavailable";
    const detail = document.createElement("p");
    detail.textContent = message || "The requested article could not be loaded.";
    box.append(heading, detail);
    root.appendChild(box);
  }

  function addRelated(container, related) {
    if (!Array.isArray(related) || !related.length) return;

    const aside = document.createElement("aside");
    const heading = document.createElement("h2");
    heading.textContent = "Related";
    aside.appendChild(heading);

    related.forEach(function (item) {
      if (!item || !item.url) return;
      const row = document.createElement("div");
      row.className = "related-item";
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = safeText(item.header || item.title || "Related article");
      row.appendChild(link);
      aside.appendChild(row);
    });

    container.appendChild(aside);
  }

  function renderArticle(data, metadata) {
    if (!data || typeof data !== "object") {
      throw new Error("The article response is empty or invalid.");
    }

    const title = safeText(data.title || data.name || "Article");
    const displayTitle = (isVideo ? "Video - " : "") + titleCase(title) +
      (data.random1 ? " [" + safeText(data.random1) + "]" : "");
    const description = safeText(data.description || data.text || "");
    const imageUrl = safeText(data.image || data.backdrop || "");
    const published = metadata && metadata.updated ? metadata.updated : new Date().toISOString();

    document.title = displayTitle;
    addMeta("description", description.slice(0, 300));
    addMeta("og:title", displayTitle, true);
    addMeta("og:description", description.slice(0, 300), true);
    if (imageUrl) addMeta("og:image", imageUrl, true);
    addMeta("robots", "index,follow");

    if (Array.isArray(data.schemas)) {
      data.schemas.forEach(function (schema) {
        if (schema && schema.id && schema.data) addSchema(schema.id, schema.data);
      });
    }
    if (metadata && Array.isArray(metadata.schemas)) {
      metadata.schemas.forEach(function (schema) {
        if (schema && schema.id && schema.data) addSchema(schema.id, schema.data);
      });
    }

    root.innerHTML = "";
    const layout = document.createElement("main");
    layout.className = "page";
    const article = document.createElement("article");

    const h1 = document.createElement("h1");
    h1.textContent = displayTitle;
    article.appendChild(h1);

    const date = document.createElement("p");
    date.className = "published";
    date.textContent = "Published on: " + new Date(published).toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    article.appendChild(date);

    if (isVideo && (data.video || data.videoUrl)) {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.src = safeText(data.video || data.videoUrl);
      article.appendChild(video);
    } else if (imageUrl) {
      const figure = document.createElement("figure");
      figure.style.margin = "0";
      const image = document.createElement("img");
      image.className = "hero";
      image.src = imageUrl;
      image.alt = title;
      figure.appendChild(image);
      if (data.caption) {
        const caption = document.createElement("figcaption");
        caption.className = "caption";
        caption.textContent = safeText(data.caption);
        figure.appendChild(caption);
      }
      article.appendChild(figure);
    }

    const paragraphs = description.split(/\n\s*\n/);
    const firstPart = document.createElement("div");
    firstPart.className = "article-copy";
    const secondPart = document.createElement("div");
    secondPart.className = "article-copy";

    if (paragraphs.length > 1) {
      const midpoint = Math.ceil(paragraphs.length / 2);
      firstPart.textContent = paragraphs.slice(0, midpoint).join("\n\n");
      secondPart.textContent = paragraphs.slice(midpoint).join("\n\n");
    } else {
      const splitAt = Math.floor(description.length / 3);
      let breakAt = description.indexOf("\n", splitAt);
      if (breakAt < 0) breakAt = splitAt;
      firstPart.textContent = description.slice(0, breakAt);
      secondPart.textContent = description.slice(breakAt);
    }

    article.appendChild(firstPart);

    const destination = metadata && (metadata.to || metadata.destination || metadata.url);
    if (destination) {
      const firstLink = document.createElement("a");
      firstLink.className = "cta";
      firstLink.href = destination;
      firstLink.textContent = "Special Access: For Our Readers Only!";
      article.appendChild(firstLink);
    }

    article.appendChild(secondPart);

    if (data.finalVerdict || data.verdict) {
      const verdictHeading = document.createElement("h2");
      verdictHeading.textContent = "Final Verdict";
      article.appendChild(verdictHeading);
      const verdict = document.createElement("p");
      verdict.className = "article-copy";
      verdict.textContent = safeText(data.finalVerdict || data.verdict);
      article.appendChild(verdict);
    }

    if (destination) {
      const secondLink = document.createElement("a");
      secondLink.className = "cta";
      secondLink.href = destination;
      secondLink.textContent = "Unlock Exclusive Details & Discounts";
      article.appendChild(secondLink);
    }

    const footer = document.createElement("footer");
    footer.textContent = " ";
    article.appendChild(footer);

    layout.appendChild(article);
    addRelated(layout, data.related);
    root.appendChild(layout);
  }

  function redirectFromMetadata(metadata) {
    if (debug || !metadata) return false;

    // Supports the first script's redirectUrl response as well as the
    // original hsdpro response shape: { redirect: true, to: "..." }.
    const destination = metadata.redirectUrl ||
      (metadata.redirect ? metadata.to : null);

    if (!destination) return false;

    let parsed;
    try {
      parsed = new URL(destination, window.location.href);
    } catch (_) {
      return false;
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    window.location.replace(parsed.href);
    return true;
  }

  function start() {
    if (!identifier) {
      showError("A URL parameter is required. Example: ?id=ARTICLE_ID");
      return;
    }

    const encodedId = encodeURIComponent(identifier);

    // Match the first script's sequence: check redirect metadata first,
    // then load/render the article if no redirect is requested.
    requestJson(META_URL + encodedId).then(function (metadata) {
      if (redirectFromMetadata(metadata)) return;
      return requestJson(ARTICLE_URL + encodedId + ARTICLE_FORMAT).then(function (article) {
        renderArticle(article, metadata || {});
      });
    }).catch(function (error) {
      console.error("Article loader error:", error);
      showError("We couldn't retrieve this article. Please check the article ID or try again later.");
    });
  }

  addStyles();
  start();
})();
