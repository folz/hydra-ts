/**
 * detectPrecision replicates hydra-synth's default precision heuristic
 * (highp on iOS, mediump elsewhere) as an opt-in, injectable helper.
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';

import { detectPrecision } from '../../src/lib/detectPrecision';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectPrecision', () => {
  test.each([
    ['iPhone', 0, 'highp'],
    ['iPad', 0, 'highp'],
    ['iPod', 0, 'highp'],
    // iPadOS reports MacIntel with a touch screen
    ['MacIntel', 5, 'highp'],
    // actual macs
    ['MacIntel', 0, 'mediump'],
    ['Win32', 0, 'mediump'],
    ['Linux x86_64', 0, 'mediump'],
  ] as const)(
    "platform '%s' with %i touch points -> %s",
    (platform, maxTouchPoints, expected) => {
      expect(detectPrecision({ platform, maxTouchPoints })).toBe(expected);
    },
  );

  test('window.MSStream opts out of the iOS detection, like upstream', () => {
    vi.stubGlobal('window', { MSStream: {} });
    expect(detectPrecision({ platform: 'iPhone', maxTouchPoints: 0 })).toBe(
      'mediump',
    );
  });

  test('defaults to mediump when no navigator exists', () => {
    expect(detectPrecision()).toBe('mediump');
  });

  test('mirrors the heuristic hydra-synth applies in its constructor', () => {
    // alarm if upstream changes its detection logic
    const upstreamSource = readFileSync(
      new URL(
        '../../node_modules/hydra-synth/src/hydra-synth.js',
        import.meta.url,
      ),
      'utf8',
    );
    expect(upstreamSource).toContain(
      '/iPad|iPhone|iPod/.test(navigator.platform)',
    );
    expect(upstreamSource).toContain(
      "navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1",
    );
    expect(upstreamSource).toContain('!window.MSStream');
    expect(upstreamSource).toContain("isIOS ? 'highp' : 'mediump'");
  });
});
