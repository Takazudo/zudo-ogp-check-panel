/**
 * Behavioral tests for the OGP debug panel script builder.
 * The builder returns a self-contained IIFE string; these tests execute
 * that string in jsdom and assert the runtime contract:
 *
 *   - console API (show/hide/toggle) registered directly on window.<ns>
 *   - panel hidden by default, shown/hidden/toggled via the API
 *   - Escape key closes the panel; listener detaches on hide
 *   - localStorage visible-flag auto-shows on (re)load
 *   - reshowEvents re-mount the panel after a <body> swap (SPA soft-navigation)
 *   - re-executing the script does not stack listeners (install guard)
 *   - existing properties on the namespace object are preserved
 *   - config values cannot break out of a <script> element
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildOgpDebugScript } from '../index';

const PANEL_ID = 'zocp-ogp-debug-panel';
const VISIBLE_KEY = 'zocp-ogp-debug-visible';
const RESHOW_EVENT = 'test:reshow';

interface InstallGuardWindow extends Window {
  __ogpDebugInstalled?: Record<string, boolean>;
  zocp?: {
    show: () => void;
    hide: () => void;
    toggle: () => void;
  };
}

const win = window as unknown as InstallGuardWindow;

function runScript(script: string): void {
  // Inline <script> execution equivalent — the IIFE runs against the jsdom
  // globals (window/document/localStorage), same as in a real page.
  new Function(script)();
}

function resetEnvironment(): void {
  document.getElementById(PANEL_ID)?.remove();
  document.body.innerHTML = '';
  window.localStorage.clear();
  delete win.__ogpDebugInstalled;
  delete win.zocp;
}

beforeEach(resetEnvironment);
afterEach(resetEnvironment);

describe('buildOgpDebugScript runtime contract', () => {
  it('registers the console API without rendering the panel', () => {
    runScript(buildOgpDebugScript());

    expect(win.zocp?.show).toBeTypeOf('function');
    expect(win.zocp?.hide).toBeTypeOf('function');
    expect(win.zocp?.toggle).toBeTypeOf('function');
    expect(document.getElementById(PANEL_ID)).toBeNull();
  });

  it('show() mounts the panel and hide() removes it', () => {
    runScript(buildOgpDebugScript());

    win.zocp!.show();
    expect(document.getElementById(PANEL_ID)).not.toBeNull();
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBe('1');

    win.zocp!.hide();
    expect(document.getElementById(PANEL_ID)).toBeNull();
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBeNull();
  });

  it('toggle() flips between shown and hidden', () => {
    runScript(buildOgpDebugScript());

    win.zocp!.toggle();
    expect(document.getElementById(PANEL_ID)).not.toBeNull();
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBe('1');

    win.zocp!.toggle();
    expect(document.getElementById(PANEL_ID)).toBeNull();
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBeNull();
  });

  it('mounts the panel with region role and accessible label', () => {
    runScript(buildOgpDebugScript());
    win.zocp!.show();

    const panel = document.getElementById(PANEL_ID)!;
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-label')).toBe('OGP debug panel');
  });

  it('Escape closes the panel and clears the visible-flag', () => {
    runScript(buildOgpDebugScript());
    win.zocp!.show();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById(PANEL_ID)).toBeNull();
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBeNull();
  });

  it('Escape listener does not stack across repeated show() calls', () => {
    runScript(buildOgpDebugScript());
    win.zocp!.show();
    win.zocp!.show();

    // A stacked listener would call hide() twice per keypress — observable as
    // two removeItem(VISIBLE_KEY) calls for a single Escape dispatch.
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const visibleRemovals = removeItemSpy.mock.calls.filter(([key]) => key === VISIBLE_KEY);
    expect(visibleRemovals).toHaveLength(1);
    removeItemSpy.mockRestore();
  });

  it('Escape after hide() is inert (listener detached)', () => {
    runScript(buildOgpDebugScript());
    win.zocp!.show();
    win.zocp!.hide();

    window.localStorage.setItem(VISIBLE_KEY, '1');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    // A leaked listener would have run hide() and cleared the flag.
    expect(window.localStorage.getItem(VISIBLE_KEY)).toBe('1');
  });

  it('auto-shows on load when the localStorage visible-flag is set', () => {
    window.localStorage.setItem(VISIBLE_KEY, '1');
    runScript(buildOgpDebugScript());

    expect(document.getElementById(PANEL_ID)).not.toBeNull();
  });

  it('re-mounts the panel via a reshow event after a body swap', () => {
    runScript(buildOgpDebugScript({ reshowEvents: [RESHOW_EVENT] }));
    win.zocp!.show();

    // Simulate an SPA router soft-swap: <body> content is replaced,
    // which removes the panel DOM; the router then fires its after-swap event.
    document.body.innerHTML = '<main>new page</main>';
    expect(document.getElementById(PANEL_ID)).toBeNull();

    document.dispatchEvent(new Event(RESHOW_EVENT));
    expect(document.getElementById(PANEL_ID)).not.toBeNull();
  });

  it('does not re-mount via a reshow event when the panel was hidden', () => {
    runScript(buildOgpDebugScript({ reshowEvents: [RESHOW_EVENT] }));
    win.zocp!.show();
    win.zocp!.hide();

    document.dispatchEvent(new Event(RESHOW_EVENT));
    expect(document.getElementById(PANEL_ID)).toBeNull();
  });

  it('re-execution keeps the console API but does not stack reshow listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const script = buildOgpDebugScript({ reshowEvents: [RESHOW_EVENT] });

    runScript(script);
    runScript(script);

    const reshowRegistrations = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === RESHOW_EVENT,
    );
    expect(reshowRegistrations).toHaveLength(1);
    expect(win.zocp?.show).toBeTypeOf('function');

    addEventListenerSpy.mockRestore();
  });

  it('preserves existing properties on the namespace object', () => {
    (win as unknown as { zocp: Record<string, unknown> }).zocp = { keepMe: 'kept' };
    runScript(buildOgpDebugScript());

    expect((win.zocp as unknown as Record<string, unknown>).keepMe).toBe('kept');
    expect(win.zocp?.toggle).toBeTypeOf('function');
  });

  it('prevents </script> breakout for every config string', () => {
    const hostile = '</script><script>alert(1)</script>';
    const script = buildOgpDebugScript({
      windowNamespace: hostile,
      panelId: hostile,
      storageKeyPrefix: hostile,
      accentColor: hostile,
      reshowEvents: [hostile],
    });

    expect(script.toLowerCase()).not.toContain('</script');
  });
});
