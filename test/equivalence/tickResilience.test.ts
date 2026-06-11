/**
 * Like hydra-synth, a failing frame is logged ("Error during tick():") and
 * does not break the render loop.
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';

import { Hydra } from '../../src/Hydra';

function makeStubRegl() {
  const stub: any = () => () => {};
  stub.buffer = (data: unknown) => ({ kind: 'buffer', data });
  stub.texture = (opts: unknown) => ({ kind: 'texture', opts });
  stub.framebuffer = (opts: unknown) => ({
    kind: 'framebuffer',
    opts,
    resize: () => {},
  });
  stub.prop = (name: string) => `prop:${name}`;
  return stub;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tick resilience', () => {
  test('a throwing draw is logged, not thrown, and later frames recover', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hydra = new Hydra({ regl: makeStubRegl(), width: 320, height: 240 });

    let shouldThrow = true;
    const draws: number[] = [];
    hydra.sources[0].draw = () => {
      if (shouldThrow) {
        throw new Error('bad frame');
      }
      draws.push(hydra.synth.time);
    };

    expect(() => hydra.tick(16)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      'Error during tick():',
      expect.any(Error),
    );

    // the loop keeps running and recovers once the failure clears
    shouldThrow = false;
    hydra.tick(16);
    expect(draws).toHaveLength(1);
  });

  test('time keeps advancing across failing frames', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hydra = new Hydra({ regl: makeStubRegl(), width: 320, height: 240 });

    hydra.outputs[0].draw = (() => {
      throw new Error('bad frame');
    }) as any;

    hydra.tick(16);
    hydra.tick(16);

    expect(hydra.synth.time).toBeCloseTo(0.032, 6);
  });

  test('matches the warning hydra-synth emits', () => {
    // alarm if upstream changes its tick error handling
    const upstreamSource = readFileSync(
      new URL(
        '../../node_modules/hydra-synth/src/hydra-synth.js',
        import.meta.url,
      ),
      'utf8',
    );
    expect(upstreamSource).toContain("console.warn('Error during tick():', e)");
  });
});
