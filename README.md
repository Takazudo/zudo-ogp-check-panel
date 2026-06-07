# zudo-ogp-check-panel

A monorepo containing the `@takazudo/zudo-ogp-check-panel` npm package — a zero-dependency, framework-agnostic Open Graph / Twitter-card debug panel that you embed as an inline `<script>`.

## Packages

| Package | Description |
|---|---|
| [`@takazudo/zudo-ogp-check-panel`](./packages/zocp/) | The published npm package. See its [README](./packages/zocp/README.md) for full usage docs. |

## Development

```sh
pnpm install          # install all workspace dependencies

pnpm build            # build all packages (outputs to packages/zocp/dist/)
pnpm typecheck        # type-check all packages
pnpm test             # run all tests

# Scoped commands (faster during development)
pnpm -F @takazudo/zudo-ogp-check-panel build
pnpm -F @takazudo/zudo-ogp-check-panel typecheck
pnpm -F @takazudo/zudo-ogp-check-panel test
pnpm -F @takazudo/zudo-ogp-check-panel test:watch
```

## Release

Releases are managed with the `/l-make-release` Claude Code skill, which handles version bumping, changelog prepending, CI gating, package validation, tag pushing, and GitHub Release creation in a single guided flow.

The publish step is triggered automatically by `.github/workflows/release.yml` when a `v*` tag is pushed — there is no manual `npm publish`. The version source-of-truth is `packages/zocp/package.json`.

See `packages/zocp/CHANGELOG.md` for release history.

## License

MIT — see [LICENSE](./LICENSE).
