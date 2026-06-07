import type { OgpDebugConfig } from './types';

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
  const storageKey = safeStringify(`${c.storageKeyPrefix}-visible`);
  const modeKey = safeStringify(`${c.storageKeyPrefix}-mode`);
  const closeId = safeStringify(`${c.panelId}-close`);
  const localBtnId = safeStringify(`${c.panelId}-mode-local`);
  const remoteBtnId = safeStringify(`${c.panelId}-mode-remote`);
  const accentColor = safeStringify(c.accentColor);
  const ns = safeStringify(c.windowNamespace);
  const reshowEvents = `[${c.reshowEvents.map(safeStringify).join(',')}]`;

  return `(function() {
  var PANEL_ID = ${panelId};
  var STORAGE_KEY = ${storageKey};
  var MODE_KEY = ${modeKey};
  var CLOSE_ID = ${closeId};
  var LOCAL_BTN_ID = ${localBtnId};
  var REMOTE_BTN_ID = ${remoteBtnId};
  var ACCENT = ${accentColor};

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

  function show() {
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
    // role="region" (not "dialog"): the panel is non-modal and never moves
    // focus, so the ARIA dialog contract (focus-in / focus-return) wouldn't hold.
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'OGP debug panel');
    panel.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'width:420px',
      'max-height:80vh',
      'overflow-y:auto',
      'background:#1a1a2e',
      'color:#e0e0e0',
      'border:1px solid #444',
      'border-radius:8px',
      'font-family:system-ui,sans-serif',
      'font-size:13px',
      'line-height:1.5',
      'z-index:99999',
      'box-shadow:0 4px 24px rgba(0,0,0,0.5)'
    ].join(';');

    var btnBase = 'border:none;cursor:pointer;padding:4px 10px;border-radius:4px;font-size:11px;font-family:system-ui,sans-serif';
    var btnActive = btnBase + ';background:' + ACCENT + ';color:#fff';
    var btnInactive = btnBase + ';background:#333;color:#888';

    var html = '<div style="padding:12px 16px;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center">'
      + '<strong style="color:' + ACCENT + ';font-size:14px">OGP Debug</strong>'
      + '<button id="' + CLOSE_ID + '" aria-label="Close OGP debug panel" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;padding:0 4px">&times;</button>'
      + '</div>';

    html += '<div style="padding:8px 16px;border-bottom:1px solid #333;display:flex;align-items:center;gap:6px">'
      + '<span style="color:#888;font-size:11px;margin-right:4px">og:image</span>'
      + '<button id="' + LOCAL_BTN_ID + '" style="' + (mode === 'local' ? btnActive : btnInactive) + '">Local</button>'
      + '<button id="' + REMOTE_BTN_ID + '" style="' + (mode === 'remote' ? btnActive : btnInactive) + '">Remote</button>'
      + '</div>';

    html += '<div style="padding:12px 16px">';

    if (ogImage) {
      html += '<div style="margin-bottom:12px;border-radius:4px;overflow:hidden;border:1px solid #333">'
        + '<img src="' + escapeHtml(displayImage) + '" alt="OG image preview" style="width:100%;height:auto;display:block" />'
        + '</div>'
        + '<div style="margin-bottom:8px;word-break:break-all;color:#888;font-size:11px">' + escapeHtml(displayImage) + '</div>';
    } else {
      html += '<div style="margin-bottom:12px;padding:24px;text-align:center;background:#111;border-radius:4px;color:#666">No og:image found</div>';
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
        html += '<div style="margin-bottom:6px">'
          + '<span style="color:#888;font-size:11px">' + escapeHtml(fields[i][0]) + '</span><br>'
          + '<span>' + escapeHtml(fields[i][1]) + '</span>'
          + '</div>';
      }
    }

    var shown = {};
    for (var j = 0; j < fields.length; j++) { if (fields[j][0] && fields[j][1]) shown[fields[j][0]] = true; }

    var extras = allMeta.filter(function(m) { return !shown[m.property]; });
    if (extras.length > 0) {
      html += '<div style="margin-top:12px;padding-top:8px;border-top:1px solid #333">'
        + '<div style="color:#888;font-size:11px;margin-bottom:6px">Other meta tags</div>';
      for (var k = 0; k < extras.length; k++) {
        html += '<div style="margin-bottom:4px">'
          + '<span style="color:#888;font-size:11px">' + escapeHtml(extras[k].property) + '</span> '
          + '<span style="font-size:12px">' + escapeHtml(extras[k].content) + '</span>'
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
