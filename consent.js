/* Guiseppe Drafts — Google Analytics 4 (G-0TX5VKF69K) with Google Consent Mode v2.
   Consent-first / opt-in: NOTHING is requested from Google, no gtag.js, no cookies,
   no pings, and no events occur before the visitor explicitly accepts.
   No Google Tag Manager. No Google Ads / Signals / personalisation. One tag per page. */
(function () {
  "use strict";

  var GA_ID = "G-0TX5VKF69K";
  var STORE_KEY = "gd_analytics_consent";      // "granted" | "denied"
  var loaded = false;                           // guards single tag load per page

  /* ---- Consent Mode v2: establish default = DENIED (local dataLayer push only) ----
     This runs on every page. It does NOT contact Google. It simply records the
     default-denied state so that if/when gtag.js is loaded after consent, it reads
     denied-then-granted in the correct order. */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  /* ---- storage helpers (fail safe if localStorage is unavailable) ---- */
  function readChoice() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function writeChoice(v) {
    try { window.localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  /* ---- delete first-party Analytics cookies we can remove from the site ---- */
  function deleteAnalyticsCookies() {
    var names = [];
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n && (n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid" || n === "_gat" || n.indexOf("_gat_") === 0)) {
        names.push(n);
      }
    });
    // always attempt the canonical GA4 names too
    if (names.indexOf("_ga") === -1) names.push("_ga");
    var host = location.hostname;                       // e.g. www.guiseppedrafts.net
    var root = host.replace(/^www\./, "");              // e.g. guiseppedrafts.net
    var domains = ["", host, "." + host, root, "." + root];
    var paths = ["/", location.pathname];
    var past = "Thu, 01 Jan 1970 00:00:00 GMT";
    names.forEach(function (n) {
      domains.forEach(function (d) {
        paths.forEach(function (p) {
          document.cookie = n + "=; expires=" + past + "; path=" + p + (d ? "; domain=" + d : "") + "; SameSite=Lax";
        });
      });
    });
  }

  /* ---- load the single Google tag (only ever called after ACCEPT) ---- */
  function loadAnalytics(sendView) {
    if (loaded) { if (sendView) gtag("event", "page_view"); return; }
    loaded = true;
    gtag("consent", "update", { analytics_storage: "granted" }); // ad_* remain denied
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    // Analytics-only config: no Ads, no Signals, no ad personalisation, no user-provided data.
    gtag("config", GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    }); // config sends the initial page_view
  }

  /* ---- accessible consent banner ---- */
  function injectStyles() {
    if (document.getElementById("gd-consent-style")) return;
    var css =
      '#gd-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:640px;margin:0 auto;' +
        'background:#fff;color:#0a0a0a;border:2px solid #0a0a0a;border-radius:10px;' +
        'box-shadow:0 8px 30px rgba(0,0,0,.18);padding:16px 18px;' +
        'font-family:Arial,Helvetica,"Liberation Sans",sans-serif;line-height:1.5}' +
      '#gd-consent[hidden]{display:none}' +
      '#gd-consent .gd-c-title{font-family:"Base Mono",ui-monospace,Consolas,monospace;font-weight:700;' +
        'text-transform:uppercase;letter-spacing:.08em;font-size:12px;margin:0 0 6px;color:#0a0a0a}' +
      '#gd-consent .gd-c-text{font-size:14px;margin:0 0 14px;color:#1a1a1a}' +
      '#gd-consent .gd-c-btns{display:flex;flex-wrap:wrap;gap:10px}' +
      '#gd-consent button{flex:1 1 160px;min-height:44px;padding:10px 16px;font-size:14px;font-weight:700;' +
        'font-family:"Base Mono",ui-monospace,Consolas,monospace;letter-spacing:.04em;text-transform:uppercase;' +
        'border-radius:7px;cursor:pointer;border:2px solid #0a0a0a}' +
      '#gd-consent .gd-accept{background:#0a0a0a;color:#fff}' +
      '#gd-consent .gd-reject{background:#fff;color:#0a0a0a}' +
      '#gd-consent button:hover{filter:brightness(.92)}' +
      '#gd-consent button:focus-visible{outline:3px solid #e8552b;outline-offset:2px}' +
      '.gd-prefs-link{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;' +
        'border-bottom:1px solid #cfcfcf;text-transform:none;letter-spacing:0}' +
      '.gd-prefs-link:focus-visible{outline:2px solid #e8552b;outline-offset:2px}';
    var st = document.createElement("style");
    st.id = "gd-consent-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  var bannerEl = null, lastFocus = null;

  function buildBanner() {
    if (bannerEl) return bannerEl;
    injectStyles();
    var b = document.createElement("div");
    b.id = "gd-consent";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-modal", "false");
    b.setAttribute("aria-labelledby", "gd-c-title");
    b.setAttribute("aria-describedby", "gd-c-text");
    b.hidden = true;
    b.innerHTML =
      '<p class="gd-c-title" id="gd-c-title">Analytics</p>' +
      '<p class="gd-c-text" id="gd-c-text">We use optional Google Analytics to understand how the site is used. ' +
        'Analytics remains off unless you accept.</p>' +
      '<div class="gd-c-btns">' +
        '<button type="button" class="gd-accept">Accept analytics</button>' +
        '<button type="button" class="gd-reject">Reject</button>' +
      '</div>';
    (document.body || document.documentElement).appendChild(b);
    b.querySelector(".gd-accept").addEventListener("click", function () { accept(); });
    b.querySelector(".gd-reject").addEventListener("click", function () { reject(); });
    // Keyboard: Escape closes without changing the stored choice (re-openable via footer).
    b.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); hideBanner(); }
    });
    bannerEl = b;
    return b;
  }

  function showBanner() {
    var b = buildBanner();
    lastFocus = document.activeElement;
    b.hidden = false;
    var f = b.querySelector(".gd-accept");
    if (f) f.focus();
  }
  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.hidden = true;
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
  }

  function accept() {
    writeChoice("granted");
    hideBanner();
    loadAnalytics(true);
  }
  function reject() {
    writeChoice("denied");
    gtag("consent", "update", { analytics_storage: "denied" }); // withdraw / stay denied
    deleteAnalyticsCookies();                                    // remove any _ga we can
    hideBanner();
  }

  /* ---- footer "Analytics preferences" link → re-open controls ---- */
  function bindPrefsLinks() {
    var links = document.querySelectorAll("[data-analytics-prefs]");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.add("gd-prefs-link");
      links[i].addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    }
  }

  /* ---- boot ---- */
  function boot() {
    bindPrefsLinks();
    var choice = readChoice();
    if (choice === "granted") {
      loadAnalytics(true);        // persisted accept → load tag + this page's page_view
    } else if (choice === "denied") {
      /* stay off; banner not shown */
    } else {
      showBanner();               // first visit → ask
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
