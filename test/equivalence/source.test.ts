/**
 * Source equivalence: texture creation (including the `params` passthrough
 * to regl.texture used for filtering options) matches hydra-synth.
 */
import { describe, expect, test } from 'vitest';

// @ts-ignore - untyped upstream javascript
import UpstreamSource from '../../node_modules/hydra-synth/src/hydra-source.js';

import { Source } from '../../src/Source';
import { GlEnvironment } from '../../src/Hydra';

interface TextureCall {
  args: unknown[];
}

function makeStubRegl() {
  const textureCalls: TextureCall[] = [];
  return {
    textureCalls,
    regl: {
      texture: (...args: unknown[]) => {
        textureCalls.push({ args });
        return { kind: 'texture', args, subimage: () => {}, resize: () => {} };
      },
    },
  };
}

function makeSources() {
  const upstreamStub = makeStubRegl();
  const tsStub = makeStubRegl();

  const upstream = new UpstreamSource({
    regl: upstreamStub.regl,
    width: 320,
    height: 240,
    pb: null,
    label: 's0',
  });

  const ours = new Source({
    regl: tsStub.regl,
    width: 320,
    height: 240,
  } as unknown as GlEnvironment);

  return { upstream, ours, upstreamStub, tsStub };
}

describe('Source', () => {
  test('constructor creates the same initial texture', () => {
    const { upstreamStub, tsStub } = makeSources();
    expect(tsStub.textureCalls).toEqual(upstreamStub.textureCalls);
  });

  test('init() forwards texture params identically to upstream', () => {
    const { upstream, ours, upstreamStub, tsStub } = makeSources();
    const media = { width: 4, height: 4 };
    const params = { min: 'linear', mag: 'linear' };

    upstream.init({ src: media }, params);
    ours.init({ src: media as any }, params as any);

    expect(tsStub.textureCalls.at(-1)).toEqual(
      upstreamStub.textureCalls.at(-1),
    );
    expect(tsStub.textureCalls.at(-1)!.args[0]).toMatchObject({
      data: media,
      min: 'linear',
      mag: 'linear',
    });
  });

  test('init() without params matches upstream', () => {
    const { upstream, ours, upstreamStub, tsStub } = makeSources();
    const media = { width: 8, height: 8 };

    upstream.init({ src: media });
    ours.init({ src: media as any });

    expect(tsStub.textureCalls.at(-1)).toEqual(
      upstreamStub.textureCalls.at(-1),
    );
  });

  test('init() can disable dynamic, like upstream', () => {
    const { upstream, ours } = makeSources();

    expect(ours.dynamic).toBe(upstream.dynamic);

    upstream.init({ dynamic: false });
    ours.init({ dynamic: false });

    expect(upstream.dynamic).toBe(false);
    expect(ours.dynamic).toBe(false);
  });
});
