/**
 * vwo-loader.js
 * Dynamically loads the VWO SmartCode for a given account.
 *
 * Usage:
 *   - Default account:  /page.html             → loads account 1185298 (async)
 *   - Custom account:   /page.html?id=XXXXX    → loads account XXXXX (async)
 *   - Sync mode:        /page.html?sync        → loads sync library instead of j.php
 *   - Both:             /page.html?id=XXXXX&sync
 *
 * Place <script src="vwo-loader.js"></script> as the FIRST script in <head>.
 */

(function () {
    'use strict';

    // Guard: never load more than once per page
    if (window.__vwoLoaderInitialized) return;
    window.__vwoLoaderInitialized = true;

    var DEFAULT_ACCOUNT_ID = '1185298';

    // Read ?id= from the current URL, fall back to default
    var params = new URLSearchParams(window.location.search);
    var accountId = params.get('id') || DEFAULT_ACCOUNT_ID;
    var isSync = window.location.href.includes('sync');

    console.log('[VWO Loader] Account:', accountId, '| Mode:', isSync ? 'sync' : 'async');

    if (isSync) {
        // ── SYNC MODE ────────────────────────────────────────────────────────────
        // Loads the synchronous VWO library (blocks rendering until loaded)
        var syncScript = document.createElement('script');
        syncScript.type = 'text/javascript';
        syncScript.id = 'vwoCode';
        syncScript.referrerPolicy = 'no-referrer-when-downgrade';
        syncScript.src = 'https://dev.visualwebsiteoptimizer.com/lib/' + accountId + '.js';
        document.head.appendChild(syncScript);
        console.log('[VWO Loader] Sync script injected for account:', accountId);

    } else {
        // ── ASYNC MODE ───────────────────────────────────────────────────────────
        // Full VWO SmartCode IIFE — matches the official async snippet exactly.
        // init() hides body immediately, loads j.php, and arms the safety timer.
        window._vwo_code = window._vwo_code || (function () {
            var account_id = accountId,
                version = 1.5,
                settings_tolerance = 2000,
                library_tolerance = 2500,
                use_existing_jquery = false,
                is_spa = 1,
                hide_element = 'body',
                hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important';

            var f = false,
                d = document,
                vwoCodeEl = d.querySelector('#vwoCode'),
                code = {
                    use_existing_jquery: function () { return use_existing_jquery; },
                    library_tolerance: function () { return library_tolerance; },
                    hide_element_style: function () { return '{' + hide_element_style + '}'; },

                    // Removes the body-hiding style once VWO has finished loading
                    finish: function () {
                        if (!f) {
                            f = true;
                            var e = d.getElementById('_vis_opt_path_hides');
                            if (e) e.parentNode.removeChild(e);
                        }
                    },
                    finished: function () { return f; },

                    // Creates and injects a <script> tag for the VWO library
                    load: function (src) {
                        var t = d.createElement('script');
                        t.fetchPriority = 'high';
                        t.src = src;
                        t.type = 'text/javascript';
                        t.onerror = function () { _vwo_code.finish(); };
                        d.getElementsByTagName('head')[0].appendChild(t);
                    },

                    getVersion: function () { return version; },

                    // Reads all _vis_opt_exp_N_combi cookies
                    getMatchedCookies: function (pattern) {
                        var t = [];
                        if (document.cookie) {
                            t = document.cookie.match(pattern) || [];
                        }
                        return t;
                    },

                    // Builds the combination cookie string for the ?c= param
                    getCombinationCookie: function () {
                        var e = code.getMatchedCookies(
                            /(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi
                        );
                        e = e.map(function (e) {
                            try {
                                var t = decodeURIComponent(e);
                                if (!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)) { return ''; }
                                return t;
                            } catch (e) { return ''; }
                        });
                        var i = [];
                        e.forEach(function (e) {
                            var t = e.match(/([\d,]+)/g);
                            t && i.push(t.join('-'));
                        });
                        return i.join('|');
                    },

                    // Entry point: hides body, arms safety timer, loads VWO
                    init: function () {
                        if (d.URL.indexOf('__vwo_disable__') > -1) return;

                        // Safety timeout: un-hides body if VWO fails to load in time
                        window.settings_timer = setTimeout(function () {
                            _vwo_code.finish();
                        }, settings_tolerance);

                        // Inject body-hiding <style>
                        var e = d.createElement('style');
                        var t = hide_element ? hide_element + '{' + hide_element_style + '}' : '';
                        var i = d.getElementsByTagName('head')[0];
                        e.setAttribute('id', '_vis_opt_path_hides');
                        if (vwoCodeEl) e.setAttribute('nonce', vwoCodeEl.nonce);
                        e.setAttribute('type', 'text/css');
                        if (e.styleSheet) { e.styleSheet.cssText = t; }
                        else { e.appendChild(d.createTextNode(t)); }
                        i.appendChild(e);

                        // Load the VWO async library with full query params
                        var n = this.getCombinationCookie();
                        this.load(
                            'https://dev.visualwebsiteoptimizer.com/j.php' +
                            '?a=' + account_id +
                            '&u=' + encodeURIComponent(d.URL) +
                            '&f=' + (+is_spa) +
                            '&vn=' + version +
                            (n ? '&c=' + n : '')
                        );
                        return settings_timer;
                    }
                };

            window._vwo_settings_timer = code.init();
            return code;
        })();

        // Set VWO custom variables (mirroring colleague's site)
        window._vwo_pc_custom = { a: 100, t: 100 };
        document.cookie = 'firstName=abc';
    }
})();
