import type { OgpDebugConfig } from './types.js';
import { STYLESHEET } from './styles.js';

const DEFAULTS: Required<OgpDebugConfig> = {
  windowNamespace: 'zocp',
  panelId: 'zocp-ogp-debug-panel',
  storageKeyPrefix: 'zocp-ogp-debug',
  accentColor: '#e8590c',
  reshowEvents: [],
};

/** JSON.stringify with </script> breakout prevention (same technique as Next.js SSR) */
function safeStringify(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export function buildOgpDebugScript(config?: OgpDebugConfig): string {
  const c = { ...DEFAULTS, ...config };

  const panelId = safeStringify(c.panelId);
  const styleId = safeStringify(`${c.panelId}-styles`);
  const storageKey = safeStringify(`${c.storageKeyPrefix}-visible`);
  const modeKey = safeStringify(`${c.storageKeyPrefix}-mode`);
  const closeId = safeStringify(`${c.panelId}-close`);
  const localBtnId = safeStringify(`${c.panelId}-mode-local`);
  const remoteBtnId = safeStringify(`${c.panelId}-mode-remote`);
  const accentColor = safeStringify(c.accentColor);
  const ns = safeStringify(c.windowNamespace);
  const reshowEvents = `[${c.reshowEvents.map(safeStringify).join(',')}]`;
  // Static stylesheet string baked into the IIFE; safeStringify keeps the
  // </script> breakout protection consistent with every other config string.
  const stylesheet = safeStringify(STYLESHEET);

  return `(function() {
  var PANEL_ID = ${panelId};
  var STYLE_ID = ${styleId};
  var STORAGE_KEY = ${storageKey};
  var MODE_KEY = ${modeKey};
  var CLOSE_ID = ${closeId};
  var LOCAL_BTN_ID = ${localBtnId};
  var REMOTE_BTN_ID = ${remoteBtnId};
  var ACCENT = ${accentColor};
  var STYLESHEET = ${stylesheet};

  function getMode() {
    try { return localStorage.getItem(MODE_KEY) || 'remote'; } catch(e) { return 'remote'; }
  }
  function setMode(mode) {
    try { localStorage.setItem(MODE_KEY, mode); } catch(e) {}
  }

  function getMeta(property) {
    var el = document.querySelector('meta[property="' + property + '"]')
      || document.querySelector('meta[name="' + property + '"]');
    return el ? el.getAttribute('content') : null;
  }

  function getAllOgMeta() {
    var metas = document.querySelectorAll('meta[property^="og:"], meta[property^="twitter:"], meta[name^="twitter:"]');
    var result = [];
    for (var i = 0; i < metas.length; i++) {
      result.push({
        property: metas[i].getAttribute('property') || metas[i].getAttribute('name'),
        content: metas[i].getAttribute('content')
      });
    }
    return result;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function toLocalPath(url) {
    if (!url) return url;
    try {
      var u = new URL(url, window.location.origin);
      return u.pathname + u.search + u.hash;
    } catch(e) {
      return url;
    }
  }

  // Inject the panel stylesheet exactly once. show() re-runs on mode switches,
  // observer refreshes and reshow re-mounts; the id guard keeps a single
  // <style> in head. textContent (never innerHTML) means a </style> in the CSS
  // could never break out. show() always runs before startObserver(), so the
  // injection lands before the head observer is armed and never triggers it.
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = STYLESHEET;
    document.head.appendChild(styleEl);
  }

  function show() {
    injectStyles();

    var existing = document.getElementById(PANEL_ID);
    if (existing) { existing.remove(); }

    try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e) {}

    var mode = getMode();
    var ogImage = getMeta('og:image');
    var ogTitle = getMeta('og:title') || document.title;
    var ogDesc = getMeta('og:description') || getMeta('description');
    var ogUrl = getMeta('og:url') || window.location.href;
    var ogType = getMeta('og:type');
    var ogSiteName = getMeta('og:site_name');
    var twitterCard = getMeta('twitter:card');
    var allMeta = getAllOgMeta();

    var displayImage = (mode === 'local' && ogImage) ? toLocalPath(ogImage) : ogImage;

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'zocp-ogp';
    // role="region" (not "dialog"): the panel is non-modal and never moves
    // focus, so the ARIA dialog contract (focus-in / focus-return) wouldn't hold.
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'OGP debug panel');
    // Accent is the one genuinely-dynamic style value: configurable per host,
    // so it stays inline as the --zocp-color-accent token the stylesheet reads.
    panel.style.setProperty('--zocp-color-accent', ACCENT);

    var localCls = 'zocp-ogp-mode-btn' + (mode === 'local' ? ' is-active' : '');
    var remoteCls = 'zocp-ogp-mode-btn' + (mode === 'remote' ? ' is-active' : '');

    var html = '<div class="zocp-ogp-header">'
      + '<strong class="zocp-ogp-title">OGP Debug</strong>'
      + '<button id="' + CLOSE_ID + '" class="zocp-ogp-close" aria-label="Close OGP debug panel">&times;</button>'
      + '</div>';

    html += '<div class="zocp-ogp-modebar">'
      + '<span class="zocp-ogp-modebar-label">og:image</span>'
      + '<button id="' + LOCAL_BTN_ID + '" class="' + localCls + '">Local</button>'
      + '<button id="' + REMOTE_BTN_ID + '" class="' + remoteCls + '">Remote</button>'
      + '</div>';

    html += '<div class="zocp-ogp-body">';

    if (ogImage) {
      html += '<div class="zocp-ogp-image">'
        + '<img class="zocp-ogp-image-img" src="' + escapeHtml(displayImage) + '" alt="OG image preview" />'
        + '</div>'
        + '<div class="zocp-ogp-image-url">' + escapeHtml(displayImage) + '</div>';
    } else {
      html += '<div class="zocp-ogp-image-empty">No og:image found</div>';
    }

    var fields = [
      ['og:title', ogTitle],
      ['og:description', ogDesc],
      ['og:url', ogUrl],
      ['og:type', ogType],
      ['og:site_name', ogSiteName],
      ['twitter:card', twitterCard]
    ];

    for (var i = 0; i < fields.length; i++) {
      if (fields[i][1]) {
        html += '<div class="zocp-ogp-field">'
          + '<span class="zocp-ogp-field-key">' + escapeHtml(fields[i][0]) + '</span><br>'
          + '<span>' + escapeHtml(fields[i][1]) + '</span>'
          + '</div>';
      }
    }

    var shown = {};
    for (var j = 0; j < fields.length; j++) { if (fields[j][0] && fields[j][1]) shown[fields[j][0]] = true; }

    var extras = allMeta.filter(function(m) { return !shown[m.property]; });
    if (extras.length > 0) {
      html += '<div class="zocp-ogp-extras">'
        + '<div class="zocp-ogp-extras-label">Other meta tags</div>';
      for (var k = 0; k < extras.length; k++) {
        html += '<div class="zocp-ogp-extra">'
          + '<span class="zocp-ogp-extra-key">' + escapeHtml(extras[k].property) + '</span> '
          + '<span class="zocp-ogp-extra-value">' + escapeHtml(extras[k].content) + '</span>'
          + '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    panel.innerHTML = html;
    document.body.appendChild(panel);

    var closeBtn = document.getElementById(CLOSE_ID);
    var localBtn = document.getElementById(LOCAL_BTN_ID);
    var remoteBtn = document.getElementById(REMOTE_BTN_ID);
    if (closeBtn) closeBtn.addEventListener('click', function() { hide(); });
    if (localBtn) localBtn.addEventListener('click', function() { setMode('local'); show(); });
    if (remoteBtn) remoteBtn.addEventListener('click', function() { setMode('remote'); show(); });

    // show() re-runs on observer refresh and mode switches — remove-then-add
    // keeps exactly one keydown listener attached while the panel is open.
    document.removeEventListener('keydown', onEscapeKeydown);
    document.addEventListener('keydown', onEscapeKeydown);
  }

  function onEscapeKeydown(e) {
    if (e.key === 'Escape') hide();
  }

  function hide() {
    var el = document.getElementById(PANEL_ID);
    if (el) el.remove();
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    document.removeEventListener('keydown', onEscapeKeydown);
    stopObserver();
  }

  var headObserver = null;
  var refreshTimer = null;
  function startObserver() {
    if (headObserver) return;
    headObserver = new MutationObserver(function() {
      if (!document.getElementById(PANEL_ID)) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function() { show(); }, 150);
    });
    headObserver.observe(document.head, { childList: true, subtree: true, attributes: true });
  }
  function stopObserver() {
    if (headObserver) { headObserver.disconnect(); headObserver = null; }
    clearTimeout(refreshTimer);
  }

  function apiShow() {
    show();
    startObserver();
  }

  // Toggle direction derives from DOM presence — show() builds the panel
  // synchronously, so the DOM is the authoritative open/closed state (no
  // mount race to route around, unlike async-rendered panels).
  function toggle() {
    if (document.getElementById(PANEL_ID)) { hide(); } else { apiShow(); }
  }

  var RESHOW_EVENTS = ${reshowEvents};

  // Console API is (re)installed on every execution — idempotent overwrite of
  // the verbs, preserving any other properties already on the namespace
  // object. Everything below (reshow listeners + auto-show) is one-shot,
  // guarded per panel id, so accidental re-execution of this script cannot
  // stack listeners.
  var api = (window[${ns}] = window[${ns}] || {});
  api.show = apiShow;
  api.hide = hide;
  api.toggle = toggle;

  var installed = (window.__ogpDebugInstalled = window.__ogpDebugInstalled || {});
  if (installed[PANEL_ID]) return;
  installed[PANEL_ID] = true;

  function reshowIfVisible() {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        show();
        startObserver();
      }
    } catch(e) {}
  }

  // SPA soft-navigation replaces <body>, removing the panel DOM. Hosts pass
  // their router's after-swap event via reshowEvents to re-mount it (and
  // re-read the new page's meta tags) when the panel was left open.
  for (var r = 0; r < RESHOW_EVENTS.length; r++) {
    document.addEventListener(RESHOW_EVENTS[r], reshowIfVisible);
  }

  reshowIfVisible();
})();`;
}
