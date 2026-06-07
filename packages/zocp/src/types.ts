export interface OgpDebugConfig {
  /**
   * Global window namespace the API verbs (show/hide/toggle) are installed
   * on (default: 'zocp' — zudo-ogp-check-panel). Existing properties on the
   * namespace object are preserved.
   */
  windowNamespace?: string;
  /** DOM id for the panel element (default: 'zocp-ogp-debug-panel') */
  panelId?: string;
  /** Prefix for localStorage keys (default: 'zocp-ogp-debug') */
  storageKeyPrefix?: string;
  /** Accent color for title and active buttons (default: '#e8590c') */
  accentColor?: string;
  /**
   * Document event names that re-show the panel (when the localStorage
   * visible-flag is set). Hosts with SPA soft-navigation replace <body> on
   * swap, which removes the panel DOM — pass the router's after-swap event
   * (e.g. your SPA router's after-swap event such as `astro:after-swap`) to re-mount it. Default: [] (no re-show).
   */
  reshowEvents?: string[];
}
