/**
 * Array-sequencing equivalence: hydra-ts's array-utils (used for
 * `osc([10,20].fast(2))`-style arguments) behaves identically to
 * hydra-synth's, including the negative-index startup behavior fixed
 * upstream in PR #157.
 */
import { beforeAll, describe, expect, test } from 'vitest';

// @ts-ignore - untyped upstream javascript
import upstreamArrayUtils from '../../node_modules/hydra-synth/src/lib/array-utils.js';
// @ts-ignore - untyped upstream javascript
import upstreamEasing from '../../node_modules/hydra-synth/src/lib/easing-functions.js';

import tsArrayUtils from '../../src/lib/array-utils';
import tsEasing from '../../src/lib/easing-functions';

beforeAll(() => {
  tsArrayUtils.init();
});

test('easing functions are identical to upstream', () => {
  expect(Object.keys(tsEasing).sort()).toEqual(
    Object.keys(upstreamEasing).sort(),
  );
  for (const name of Object.keys(upstreamEasing)) {
    for (const t of [0, 0.1, 0.25, 0.5, 0.617, 0.75, 0.99, 1]) {
      expect(tsEasing[name as keyof typeof tsEasing](t), `${name}(${t})`).toBe(
        upstreamEasing[name](t),
      );
    }
  }
});

describe('getValue', () => {
  // Includes very small times: with smoothing, the interpolation index is
  // negative right after startup, which is exactly the region PR #157 fixed.
  const times = [
    0, 0.001, 0.016, 0.05, 0.1, 0.24, 0.25, 0.26, 0.5, 0.51, 0.75, 0.99, 1, 1.5,
    1.998, 2, 3.21, 5, 12.34, 60,
  ];
  const bpms = [30, 60, 144];

  function expectSameSequence(makeArray: () => number[]) {
    const tsArray = makeArray();
    const upstreamArray = makeArray();
    for (const bpm of bpms) {
      for (const time of times) {
        const ours = tsArrayUtils.getValue(tsArray)({ time, bpm });
        const theirs = upstreamArrayUtils.getValue(upstreamArray)({
          time,
          bpm,
        });
        expect(ours, `time=${time} bpm=${bpm}`).toBe(theirs);
      }
    }
  }

  test('plain arrays', () => {
    expectSameSequence(() => [1, 5, 9]);
  });

  test('.fast()', () => {
    expectSameSequence(() => [1, 5, 9].fast(2));
    expectSameSequence(() => [10, 20].fast(0.25));
  });

  test('.smooth()', () => {
    expectSameSequence(() => [0, 1].smooth(1));
    expectSameSequence(() => [1, 5, 9, 2].smooth(0.5));
  });

  test('.smooth() with .ease()', () => {
    expectSameSequence(() => [0, 1, 4].smooth(1).ease('easeInQuad'));
    expectSameSequence(() => [3, -2].smooth(1).ease('easeOutElastic'));
  });

  test('.offset()', () => {
    expectSameSequence(() => [1, 5, 9].offset(0.3));
  });

  test('.fit()', () => {
    expectSameSequence(() => [1, 5, 9].fit(0, 1));
  });

  test('combined metadata', () => {
    expectSameSequence(() =>
      [4, 8, 15, 16, 23, 42].fast(3).smooth(1).offset(0.6),
    );
  });

  test('smoothing produces finite in-range values right after startup', () => {
    // regression guard for the negative-index glitch fixed in PR #157
    for (const time of [0, 0.0001, 0.001, 0.01, 0.1, 0.49]) {
      const value = tsArrayUtils.getValue([0, 1].smooth(1))({ time, bpm: 30 });
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
