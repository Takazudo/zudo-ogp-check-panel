# Changelog

All notable changes to `@takazudo/zudo-ogp-check-panel` will be documented here.

## 0.1.0

### Features

- Initial standalone release of `@takazudo/zudo-ogp-check-panel`.
- `buildOgpDebugScript(config?)` — generates a self-contained IIFE string that embeds an OGP debug panel into any HTML page via a `<script>` tag.
- `OgpDebugConfig` — configurable options: `windowNamespace`, `panelId`, `storageKeyPrefix`, `accentColor`, `reshowEvents`.
- og:image preview with Local / Remote URL toggle.
- og/twitter meta-field display with sensible fallbacks (`document.title`, `window.location.href`).
- "Other meta tags" section for remaining `og:*` / `twitter:*` elements.
- Self-contained CSS injected as a single `<style id="<panelId>-styles">` scoped to `--zocp-*` custom properties; no leakage into or from the host page.
- `MutationObserver`-based auto-refresh when `<head>` meta tags change.
- `reshowEvents` support for SPA soft-navigation routers that replace `<body>` on page transition.
- Persistence of panel visibility and image mode via `localStorage`.
- Escape key and close button to dismiss the panel.
- Zero runtime dependencies.
