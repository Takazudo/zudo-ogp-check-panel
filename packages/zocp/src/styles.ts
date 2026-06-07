/**
 * Self-encapsulated stylesheet for the OGP debug panel.
 *
 * The generated IIFE injects this CSS once into `document.head` as a single
 * `<style id="<panelId>-styles">`. Replaces the per-element inline styles that
 * the panel used to write via `style.cssText`.
 *
 * Encapsulation contract (mirrors the discipline of the sibling design-token
 * panel — see its PORTABLE-CONTRACT §7 — adapted to vanilla JS, no Tailwind):
 *
 * - **Namespaced tokens.** Every custom property uses the `--zocp-*` prefix and
 *   is declared on the panel-root block (`.zocp-ogp`) via `:where()` — NEVER on
 *   `:root` — so nothing leaks onto the host page and a host can still override
 *   any token with a single-class rule.
 * - **Self-contained palette.** The dark palette below is baked-in (values match
 *   the panel's original inline theme). The panel paints with this palette
 *   regardless of the host's own `--color-*` / `--font-*` tokens — it reads NONE
 *   of them. The only dynamic value is `--zocp-color-accent`, set inline on the
 *   root from the configurable `accentColor`.
 * - **Flat BEM-ish selectors.** Block `zocp-ogp`, elements `zocp-ogp-<part>`,
 *   state modifiers `is-<state>` as a second class. One class per rule, no
 *   descendant chains, no id styling hooks, no `@layer`.
 * - **Defensive reset.** The root sets box-sizing/line-height/font/color and a
 *   `:where(.zocp-ogp *)` box-sizing reset so hostile host CSS cannot distort
 *   the panel; the panel does not rely on host-inherited typography or colors.
 *
 * The string is a static constant (no per-config interpolation), which keeps it
 * free of any CSS-injection surface.
 */
export const STYLESHEET = `:where(.zocp-ogp) {
  --zocp-color-bg: #1a1a2e;
  --zocp-color-fg: #e0e0e0;
  --zocp-color-border: #444;
  --zocp-color-border-muted: #333;
  --zocp-color-muted: #888;
  --zocp-color-faint: #666;
  --zocp-color-placeholder-bg: #111;
  --zocp-color-btn-bg: #333;
  --zocp-color-on-accent: #fff;
  --zocp-color-accent: #e8590c;

  --zocp-font: system-ui, sans-serif;
  --zocp-text-xs: 11px;
  --zocp-text-sm: 12px;
  --zocp-text-md: 13px;
  --zocp-text-lg: 14px;
  --zocp-text-xl: 18px;

  --zocp-space-2xs: 4px;
  --zocp-space-xs: 6px;
  --zocp-space-sm: 8px;
  --zocp-space-md: 10px;
  --zocp-space-lg: 12px;
  --zocp-space-xl: 16px;
  --zocp-space-2xl: 24px;

  --zocp-radius-sm: 4px;
  --zocp-radius-md: 8px;
  --zocp-z: 99999;
}

.zocp-ogp {
  position: fixed;
  bottom: var(--zocp-space-xl);
  right: var(--zocp-space-xl);
  box-sizing: border-box;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--zocp-color-bg);
  color: var(--zocp-color-fg);
  border: 1px solid var(--zocp-color-border);
  border-radius: var(--zocp-radius-md);
  font-family: var(--zocp-font);
  font-size: var(--zocp-text-md);
  line-height: 1.5;
  z-index: var(--zocp-z);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.zocp-ogp *,
.zocp-ogp *::before,
.zocp-ogp *::after {
  box-sizing: border-box;
}

.zocp-ogp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--zocp-space-lg) var(--zocp-space-xl);
  border-bottom: 1px solid var(--zocp-color-border-muted);
}

.zocp-ogp-title {
  color: var(--zocp-color-accent);
  font-size: var(--zocp-text-lg);
  font-weight: bold;
}

.zocp-ogp-close {
  padding: 0 var(--zocp-space-2xs);
  background: none;
  border: none;
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xl);
  cursor: pointer;
}

.zocp-ogp-modebar {
  display: flex;
  align-items: center;
  gap: var(--zocp-space-xs);
  padding: var(--zocp-space-sm) var(--zocp-space-xl);
  border-bottom: 1px solid var(--zocp-color-border-muted);
}

.zocp-ogp-modebar-label {
  margin-right: var(--zocp-space-2xs);
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xs);
}

.zocp-ogp-mode-btn {
  padding: var(--zocp-space-2xs) var(--zocp-space-md);
  border: none;
  border-radius: var(--zocp-radius-sm);
  font-family: var(--zocp-font);
  font-size: var(--zocp-text-xs);
  cursor: pointer;
  background: var(--zocp-color-btn-bg);
  color: var(--zocp-color-muted);
}

.zocp-ogp-mode-btn.is-active {
  background: var(--zocp-color-accent);
  color: var(--zocp-color-on-accent);
}

.zocp-ogp-body {
  padding: var(--zocp-space-lg) var(--zocp-space-xl);
}

.zocp-ogp-image {
  margin-bottom: var(--zocp-space-lg);
  overflow: hidden;
  border: 1px solid var(--zocp-color-border-muted);
  border-radius: var(--zocp-radius-sm);
}

.zocp-ogp-image-img {
  display: block;
  width: 100%;
  height: auto;
}

.zocp-ogp-image-url {
  margin-bottom: var(--zocp-space-sm);
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xs);
  word-break: break-all;
}

.zocp-ogp-image-empty {
  margin-bottom: var(--zocp-space-lg);
  padding: var(--zocp-space-2xl);
  background: var(--zocp-color-placeholder-bg);
  border-radius: var(--zocp-radius-sm);
  color: var(--zocp-color-faint);
  text-align: center;
}

.zocp-ogp-field {
  margin-bottom: var(--zocp-space-xs);
}

.zocp-ogp-field-key {
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xs);
}

.zocp-ogp-extras {
  margin-top: var(--zocp-space-lg);
  padding-top: var(--zocp-space-sm);
  border-top: 1px solid var(--zocp-color-border-muted);
}

.zocp-ogp-extras-label {
  margin-bottom: var(--zocp-space-xs);
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xs);
}

.zocp-ogp-extra {
  margin-bottom: var(--zocp-space-2xs);
}

.zocp-ogp-extra-key {
  color: var(--zocp-color-muted);
  font-size: var(--zocp-text-xs);
}

.zocp-ogp-extra-value {
  font-size: var(--zocp-text-sm);
}
`;
