# @takazudo/zudo-ogp-check-panel

A zero-dependency, framework-agnostic Open Graph / Twitter-card debug panel you inline as a `<script>`. Call `buildOgpDebugScript()` at build time or on the server, embed the returned IIFE string in a `<script>` tag, and activate the panel from the browser console whenever you need to inspect a page's OGP meta tags — no browser extension, no external service required.

## Install

```sh
pnpm add @takazudo/zudo-ogp-check-panel
# npm install @takazudo/zudo-ogp-check-panel
# yarn add @takazudo/zudo-ogp-check-panel
```

## Usage

Generate the script once at build time (or per-request on the server) and embed it in your HTML:

```ts
import { buildOgpDebugScript } from '@takazudo/zudo-ogp-check-panel';

// Generate the IIFE string (no <script> tags included)
const script = buildOgpDebugScript({
  accentColor: '#e8590c', // optional — override the accent color
});

// Embed in your HTML output (server-rendered template, build plugin, etc.)
const html = `
  <!doctype html>
  <html>
    <head>...</head>
    <body>
      ...
      <script>${script}</script>
    </body>
  </html>
`;
```

Once the page loads, open the browser console and call:

```js
window.zocp.toggle(); // show or hide the panel
window.zocp.show();   // show
window.zocp.hide();   // close
```

The panel reads the current page's OGP meta tags and renders them immediately. Press **Escape** to close.

## What it inspects

- **og:image preview** — renders the image with a Local / Remote URL toggle (useful when the full URL differs from its path-only equivalent in local dev).
- **og/twitter fields** — `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `twitter:card`, with `document.title` / `window.location.href` as fallbacks where applicable.
- **Other meta tags** — any remaining `og:*` or `twitter:*` / `twitter:*` meta elements not shown in the main fields.

## Configuration

Pass an optional `OgpDebugConfig` object to `buildOgpDebugScript`:

| Option | Type | Default | Description |
|---|---|---|---|
| `windowNamespace` | `string` | `'zocp'` | Global window property the API verbs (`show` / `hide` / `toggle`) are installed on. Existing properties on the namespace object are preserved. |
| `panelId` | `string` | `'zocp-ogp-debug-panel'` | `id` attribute of the panel element. |
| `storageKeyPrefix` | `string` | `'zocp-ogp-debug'` | Prefix for `localStorage` keys that persist panel visibility and image-mode across page loads. |
| `accentColor` | `string` | `'#e8590c'` | Accent color for the panel title and active buttons. Any valid CSS color value. |
| `reshowEvents` | `string[]` | `[]` | Document event names that re-show the panel when it was left open. SPA routers that replace `<body>` on soft-navigation remove the panel DOM — pass the router's after-swap event (e.g. `astro:after-swap`) to re-mount it on each navigation. |

### SPA / soft-navigation example

```ts
const script = buildOgpDebugScript({
  reshowEvents: ['astro:after-swap'], // re-mount on each page transition
});
```

## Notes

- **Zero dependencies** — the package has no runtime dependencies. The generated script is a self-contained IIFE.
- **Self-encapsulated styling** — the panel injects a single `<style>` element (`id="<panelId>-styles"`) on first show. All CSS custom properties use the `--zocp-*` namespace scoped to the panel root; they are never declared on `:root`. The panel reads no `var(--…)` tokens from the host page and cannot be broken by host CSS.
- **Window namespace safety** — the API verbs are installed on `window[windowNamespace]` using `||= {}` semantics, so any properties you placed on that object before the script runs are preserved.

## License

MIT
