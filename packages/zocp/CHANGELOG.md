# Changelog

All notable changes to `@takazudo/zudo-ogp-check-panel` will be documented here.

## 0.1.2

### Fixed

- Removed the `engines` block (`engines.pnpm` and `engines.node`) from the published manifest. `engines.pnpm` hard-failed pnpm 10 consumers with `ERR_PNPM_UNSUPPORTED_ENGINE` whenever a pnpm command ran against the installed package dir; `engines.node` is dropped too since the library is a zero-dependency browser/DOM utility with no Node API usage. Dev-tooling constraints remain in the private workspace root. ([#15](https://github.com/Takazudo/zudo-ogp-check-panel/issues/15)) (01dfb21)

## 0.1.1

### Fixed

- node16/nodenext typings: relative imports in the emitted `.d.ts` now carry `.js` extensions, so TypeScript consumers using `moduleResolution: node16`/`nodenext` resolve the types correctly (cleared `@arethetypeswrong/cli`'s `InternalResolutionError`). ([#10](https://github.com/Takazudo/zudo-ogp-check-panel/issues/10))

### Other Changes

- ci(release): publish via `npm publish --provenance` on Node 24 instead of `pnpm -r publish`, so releases carry an npm provenance attestation. ([#11](https://github.com/Takazudo/zudo-ogp-check-panel/issues/11))

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
