/**
 * Glsl.glsl(environment): compiles a chain without rendering it, returning
 * passes shaped like hydra-synth's GlslSource.glsl() — same array form,
 * byte-identical frag, equivalent uniforms.
 */
import { describe, expect, test } from 'vitest';

import { GlEnvironment } from '../../src/Hydra';
import {
  buildUpstream,
  DEFAULT_UNIFORMS,
  expectEquivalentUniforms,
  makeContext,
  PRECISION,
} from './helpers';
import { osc, noise, src } from '../../src/glsl';

const environment = {
  precision: PRECISION,
  defaultUniforms: { ...DEFAULT_UNIFORMS },
} as unknown as GlEnvironment;

describe('Glsl.glsl()', () => {
  test('returns a single pass shaped like upstream', () => {
    const upstream = buildUpstream();

    const upstreamPasses = upstream.generators.osc(10).glsl();
    const ourPasses = osc(10).glsl(environment);

    expect(ourPasses).toHaveLength(upstreamPasses.length);
    expect(Object.keys(ourPasses[0]).sort()).toEqual(
      Object.keys(upstreamPasses[0]).sort(),
    );
  });

  test('compiles byte-identical frag and equivalent uniforms', () => {
    const ctx = makeContext();
    const upstream = buildUpstream();

    const build = (g: {
      osc: (...args: unknown[]) => any;
      noise: (...args: unknown[]) => any;
      src: (...args: unknown[]) => any;
    }) =>
      g
        .osc(7, 0.05, () => 0.4)
        .modulate(g.noise(3), 0.2)
        .blend(g.src(ctx.o0), 0.6);

    const upstreamPass = build(upstream.generators as any).glsl()[0];
    const ourPass = build({ osc, noise, src } as any).glsl(environment)[0];

    expect(ourPass.frag).toBe(upstreamPass.frag);
    expectEquivalentUniforms(ourPass.uniforms, upstreamPass.uniforms);
  });

  test('does not render or mutate the chain', () => {
    const chain = osc(10);
    const before = chain.transforms;

    chain.glsl(environment);

    expect(chain.transforms).toBe(before);
  });
});
