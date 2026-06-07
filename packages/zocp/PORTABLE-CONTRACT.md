# Portable Contract — @takazudo/zudo-ogp-check-panel

This document is a checkable specification of the public API surface and the CSS-encapsulation invariant. Future changes must satisfy every item; the grep commands below are the acceptance checks.

---

## 1. Public API

### Exported identifiers

The package (`packages/zocp/src/index.ts` or re-exported equivalent) exposes exactly two public names:

| Export | Kind | Description |
|---|---|---|
| `buildOgpDebugScript` | function | Accepts an optional `OgpDebugConfig` and returns a `string` — the IIFE source to embed in a `<script>` tag. |
| `OgpDebugConfig` | TypeScript interface | The configuration type accepted by `buildOgpDebugScript`. |

No other identifiers are part of the public contract. Internal helpers (`DEFAULTS`, `STYLESHEET`, `safeStringify`, etc.) are not exported and must remain private.

### `buildOgpDebugScript` signature

```ts
function buildOgpDebugScript(config?: OgpDebugConfig): string
```

- All config properties are optional; defaults apply when omitted.
- The returned string is a complete, immediately-invocable IIFE (`(function(){…})()`). It does **not** include `<script>` wrapper tags — the caller wraps it.

### `OgpDebugConfig` properties and defaults

| Property | Type | Default | Notes |
|---|---|---|---|
| `windowNamespace` | `string` | `'zocp'` | Global window key for the `show` / `hide` / `toggle` API. Existing properties on the namespace object are preserved (additive assignment). |
| `panelId` | `string` | `'zocp-ogp-debug-panel'` | `id` attribute of the panel root element. Also used as the prefix for child element ids (`<panelId>-close`, `-mode-local`, `-mode-remote`) and the stylesheet element (`<panelId>-styles`). |
| `storageKeyPrefix` | `string` | `'zocp-ogp-debug'` | Prefix for the `localStorage` keys `<prefix>-visible` and `<prefix>-mode`. |
| `accentColor` | `string` | `'#e8590c'` | Inline-set as `--zocp-color-accent` on the panel root. Any valid CSS color value is accepted. |
| `reshowEvents` | `string[]` | `[]` | Document event names listened to for SPA after-swap re-mounting. |

---

## 2. Runtime-installed API (window namespace)

After the IIFE executes, `window[windowNamespace]` exposes:

| Verb | Effect |
|---|---|
| `.show()` | Renders the panel, injects styles (once), starts the `MutationObserver`. |
| `.hide()` | Removes the panel element, clears the visibility `localStorage` key, stops the observer. |
| `.toggle()` | Shows if the panel is absent from the DOM, hides if present. Toggle state is DOM-authoritative (synchronous check). |

---

## 3. CSS-encapsulation invariant

### 3a. Namespace

Every CSS custom property used inside the panel stylesheet uses the `--zocp-*` prefix.

**Acceptance check:**

```sh
grep 'var(--' packages/zocp/src/styles.ts
```

All lines must match `var(--zocp-`. No line may reference a host-defined token (e.g. `var(--color-…)`, `var(--font-…)`, or any non-`--zocp-` property).

### 3b. Token scope — no `:root` declaration

Custom properties are declared on `:where(.zocp-ogp)`, never on `:root`. This ensures tokens are scoped to the panel root and do not leak onto the host document.

**Acceptance check:**

```sh
grep ':root' packages/zocp/src/styles.ts
```

Must produce **no output** (or only comment lines — no actual CSS rule targeting `:root`).

### 3c. Single injected stylesheet

The panel injects exactly one `<style>` element, identified by `id="<panelId>-styles"`, using an id-guard (`if (document.getElementById(STYLE_ID)) return`). Style content is set via `styleEl.textContent` (never `innerHTML`), preventing any CSS breakout.

### 3d. No host inheritance

The panel's dark color palette is fully self-contained in `STYLESHEET`. The panel reads no inherited or ambient CSS tokens from the host page. The only exception is `--zocp-color-accent`, which is the single configurable token and is set inline on the panel root element by the IIFE from the `accentColor` config value.

### 3e. DOM hygiene

- All element ids are prefixed with the configurable `panelId` value.
- All CSS class names use the `zocp-ogp` BEM block prefix.
- The panel is appended to `document.body` and removed cleanly on hide (no stale nodes).
- The `MutationObserver` is disconnected on hide; the `keydown` listener is removed on hide.

---

## 4. Stylesheet delivery

The static stylesheet string is defined in `packages/zocp/src/styles.ts` as `export const STYLESHEET`. It contains no per-config interpolation and no dynamic values — it is a compile-time constant. The single runtime-dynamic value (`accentColor`) is applied inline on the panel root, not via the stylesheet.

---

## 5. Dependency invariant

The package has zero runtime dependencies. `package.json` must have an empty `"dependencies": {}` object. All items in `devDependencies` are build/test tools only.

**Acceptance check:**

```sh
node -e "const d = require('./packages/zocp/package.json').dependencies; if (Object.keys(d).length) process.exit(1); else console.log('ok')"
```
