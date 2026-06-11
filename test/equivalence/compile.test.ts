/**
 * The headline equivalence demonstration: for a corpus of sketches covering
 * every transform (plus nesting, feedback, arrays, function args, external
 * sources and uniform numbering), hydra-ts compiles BYTE-IDENTICAL fragment
 * shaders to hydra-synth, and equivalent uniforms.
 */
import { describe, expect, test, vi, beforeAll } from 'vitest';

// @ts-ignore - untyped upstream javascript
import upstreamGlslFunctions from 'hydra-synth/src/glsl/glsl-functions.js';

import arrayUtils from '../../src/lib/array-utils';
import {
  buildHydraTs,
  buildUpstream,
  EquivalenceContext,
  expectEquivalentUniforms,
  makeContext,
} from './helpers';

beforeAll(() => {
  // registers Array.prototype.fast/smooth/ease/offset/fit, used by the
  // "array metadata" cases below. Both compilers read the same metadata.
  arrayUtils.init();
  // the "function arg returning a non-number" case makes both sides warn
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

type Generators = Record<string, (...args: any[]) => any>;

interface Case {
  name: string;
  build: (g: Generators, ctx: EquivalenceContext) => any;
}

const cases: Case[] = [];

// --- programmatic coverage of every single transform --------------------

const upstreamDefs: Array<{
  name: string;
  type: string;
  inputs: Array<{ name: string; type: string; default?: unknown }>;
}> = upstreamGlslFunctions();

for (const def of upstreamDefs) {
  if (def.type === 'src') {
    cases.push({
      name: `generator ${def.name} (defaults)`,
      build: (g, ctx) => (def.name === 'src' ? g.src(ctx.s0) : g[def.name]()),
    });
    if (def.inputs.length > 0 && def.inputs.every((i) => i.type === 'float')) {
      cases.push({
        name: `generator ${def.name} (explicit args)`,
        build: (g) => g[def.name](...def.inputs.map((_, j) => (j + 1) * 0.37)),
      });
    }
  } else {
    const takesSource = def.type === 'combine' || def.type === 'combineCoord';
    cases.push({
      name: `modifier ${def.name} (defaults)`,
      build: (g) => {
        const head = g.osc(10, 0.1, 0.5);
        return takesSource
          ? head[def.name](g.shape(3.1, 0.25))
          : head[def.name]();
      },
    });
    cases.push({
      name: `modifier ${def.name} (explicit args)`,
      build: (g) => {
        const args = def.inputs.map((input, j) =>
          input.type === 'float' ? (j + 1) * 0.37 : g.noise(2.5),
        );
        const head = g.noise(3, 0.2);
        return takesSource
          ? head[def.name](g.gradient(0.3), ...args)
          : head[def.name](...args);
      },
    });
  }
}

// --- hand-written cases for structure, feedback, and dynamic args -------

cases.push(
  {
    name: 'chained coord/color transforms',
    build: (g) => g.osc(60, 0.1, 0.5).rotate(0.8).kaleid(5).colorama(0.1),
  },
  {
    name: 'feedback: src(o0) blended back into itself',
    build: (g, ctx) => g.src(ctx.o0).blend(g.osc(8), 0.1),
  },
  {
    name: 'prev() feedback',
    build: (g) => g.osc(40).blend(g.prev(), 0.7),
  },
  {
    name: 'output instance as combine argument (implicit src() wrapping)',
    build: (g, ctx) => g.osc(30).diff(ctx.o1),
  },
  {
    name: 'source instance as modulate argument (implicit src() wrapping)',
    build: (g, ctx) => g.voronoi(5).modulate(ctx.s0, 0.05),
  },
  {
    name: 'external source via src()',
    build: (g, ctx) => g.src(ctx.s1).color(0.9, 0.4, 0.1, 1),
  },
  {
    name: 'coord transform after modulate (uv mutation order)',
    build: (g) => g.osc(10).modulate(g.noise(3), 0.2).rotate(0.4),
  },
  {
    name: 'coord transform before combine (nested uv copies)',
    build: (g) => g.osc(10).rotate(0.5).blend(g.noise(4), 0.3),
  },
  {
    name: 'deep nesting',
    build: (g, ctx) =>
      g
        .osc(4, 0.1)
        .modulate(g.noise(3).rotate(0.7).blend(ctx.o0), 0.6)
        .diff(g.shape(4).repeat(3, 3)),
  },
  {
    name: 'nested modulation inside nested combine',
    build: (g) =>
      g
        .voronoi(10, 0.4)
        .mask(g.shape(5).modulateScale(g.osc(2), 0.4))
        .mult(g.gradient(0.2), 0.6),
  },
  {
    name: 'same transform repeated (glsl function dedupe)',
    build: (g) => g.osc().rotate(0.1).rotate(0.2).rotate(0.3),
  },
  {
    name: 'same generator nested twice (uniform numbering)',
    build: (g) => g.osc(1).blend(g.osc(2).blend(g.osc(3), 0.5), 0.25),
  },
  {
    name: 'array arguments',
    build: (g) => g.osc([10, 30, 60]),
  },
  {
    name: 'array arguments with fast/smooth/offset metadata',
    build: (g) => g.osc([10, 30, 60].fast(2).smooth(1).offset(0.3)),
  },
  {
    name: 'array arguments with ease',
    build: (g) => g.shape([3, 4, 5].ease('easeInOutCubic')),
  },
  {
    name: 'array arguments with fit',
    build: (g) => g.shape([3, 4, 5].fit(3, 9)),
  },
  {
    name: 'function argument',
    build: (g) => g.osc(({ time }: { time: number }) => 10 + time),
  },
  {
    name: 'function argument returning a non-number falls back to default',
    build: (g) => g.osc(() => 'not a number'),
  },
  {
    name: 'function argument throwing falls back to default',
    build: (g) =>
      g.osc(() => {
        throw new Error('user code error');
      }),
  },
  {
    name: 'several dynamic uniforms across the chain',
    build: (g) =>
      g
        .osc(
          () => 1,
          () => 2,
        )
        .rotate([0.1, 0.9])
        .blend(
          g.noise(() => 3),
          () => 0.4,
        ),
  },
  {
    name: 'kaleid modulated by an output',
    build: (g, ctx) => g.gradient(1).modulateKaleid(ctx.o1, 3),
  },
  {
    name: 'luma-keyed layer',
    build: (g, ctx) => g.src(ctx.s0).layer(g.osc(30).luma(0.5, 0.1)),
  },
  {
    name: 'mixed coord/combineCoord/combine pipeline',
    build: (g) =>
      g
        .voronoi(10)
        .scale(1.5)
        .modulateScale(g.osc(2), 0.5)
        .scrollX(0.1)
        .add(g.solid(0.2, 0, 0.4, 1), 0.8),
  },
);

// -------------------------------------------------------------------------

describe('compiled fragment shaders are byte-identical to hydra-synth', () => {
  for (const c of cases) {
    test(c.name, () => {
      const ctx = makeContext();
      const upstream = buildUpstream();
      const hydraTs = buildHydraTs();

      const upstreamPass = upstream.compile(c.build(upstream.generators, ctx));
      const hydraTsPass = hydraTs.compile(c.build(hydraTs.generators, ctx));

      expect(hydraTsPass.frag).toBe(upstreamPass.frag);
      expectEquivalentUniforms(hydraTsPass.uniforms, upstreamPass.uniforms);
    });
  }
});

describe('error behavior parity', () => {
  test('passing a number where a texture is expected throws on both sides', () => {
    const upstream = buildUpstream();
    const hydraTs = buildHydraTs();

    expect(() =>
      upstream.compile(upstream.generators.osc(10).blend(0.5)),
    ).toThrow();
    expect(() =>
      hydraTs.compile(hydraTs.generators.osc(10).blend(0.5)),
    ).toThrow('Arguments must be a texture or GlslSource');
  });

  test('passing an array where a texture is expected throws on both sides', () => {
    const upstream = buildUpstream();
    const hydraTs = buildHydraTs();

    expect(() =>
      upstream.compile(upstream.generators.osc(10).mult([1, 0, 0, 1])),
    ).toThrow();
    expect(() =>
      hydraTs.compile(hydraTs.generators.osc(10).mult([1, 0, 0, 1])),
    ).toThrow('Arguments must be a texture or GlslSource');
  });
});
