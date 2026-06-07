import { defineConfig } from 'vite';

/**
 * Vite config for `@takazudo/zudo-ogp-check-panel`.
 *
 * Lib bundle — `vite build` emits `dist/index.js` (ESM, single entry).
 * `build.sourcemap: false` avoids shipping source-revealing maps.
 * Type emission is handled separately by `tsc -p tsconfig.build.json`
 * (vite-plugin-dts intentionally avoided — explicit tsc gives single-source-
 * of-truth control over the .d.ts shape).
 */
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
    sourcemap: false,
  },
});
