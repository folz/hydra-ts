/**
 * Shared helpers for the equivalence test suite.
 *
 * These tests demonstrate that hydra-ts produces byte-identical fragment
 * shaders (and equivalent uniforms) to the pinned hydra-synth devDependency.
 * hydra-synth's npm package ships its source, so we drive its real compiler
 * (GeneratorFactory/GlslSource) without a WebGL context and compare against
 * hydra-ts's compiler.
 */

// hydra-synth's package exports map only exposes the root entry point and
// glsl-functions.js, so the other internals are imported via explicit
// node_modules paths.
// @ts-ignore - untyped upstream javascript
import UpstreamGeneratorFactory from '../../node_modules/hydra-synth/src/generator-factory.js';

import { GlEnvironment, Precision } from '../../src/Hydra';
import {
  CompiledTransform,
  compileWithEnvironment,
} from '../../src/compiler/compileWithEnvironment';
import { Glsl } from '../../src/glsl/Glsl';
import * as tsGenerators from '../../src/glsl/index';
import { expect } from 'vitest';

export const PRECISION: Precision = 'mediump';

// Sentinel uniform values shared by both sides, standing in for
// regl.prop('time') / regl.prop('resolution').
export const DEFAULT_UNIFORMS = {
  time: 'sentinel:time',
  resolution: 'sentinel:resolution',
} as const;

/** Minimal stand-in for a hydra Source/Output: both compilers only require
 * a getTexture() method. */
export function makeTextureStub(label: string) {
  return { getTexture: () => `texture:${label}` };
}

export interface EquivalenceContext {
  s0: ReturnType<typeof makeTextureStub>;
  s1: ReturnType<typeof makeTextureStub>;
  o0: ReturnType<typeof makeTextureStub>;
  o1: ReturnType<typeof makeTextureStub>;
}

export function makeContext(): EquivalenceContext {
  return {
    s0: makeTextureStub('s0'),
    s1: makeTextureStub('s1'),
    o0: makeTextureStub('o0'),
    o1: makeTextureStub('o1'),
  };
}

export interface CompilerSide {
  // both sides expose generator functions of the same names (osc, noise, ...)
  // returning chainable objects with the same modifier methods (rotate, ...)
  generators: Record<string, (...args: unknown[]) => any>;
  compile(chain: any): { frag: string; uniforms: Record<string, unknown> };
}

export function buildUpstream(): CompilerSide {
  const factory = new UpstreamGeneratorFactory({
    defaultUniforms: { ...DEFAULT_UNIFORMS },
    // GlslSource.compile() only reads `precision` from the default output
    defaultOutput: { precision: PRECISION },
    changeListener: () => {},
  });

  return {
    generators: factory.generators,
    compile(chain: any) {
      const passes = chain.glsl();
      expect(passes).toHaveLength(1);
      return passes[0];
    },
  };
}

export function buildHydraTs(): CompilerSide {
  const environment = {
    precision: PRECISION,
    defaultUniforms: { ...DEFAULT_UNIFORMS },
  } as unknown as GlEnvironment;

  return {
    generators: tsGenerators as unknown as CompilerSide['generators'],
    compile(chain: Glsl): CompiledTransform {
      return compileWithEnvironment(chain.transforms.toArray(), environment);
    },
  };
}

// Sample props used to evaluate dynamic (function/array) uniforms on both
// sides. Small time values cover the negative-index startup region of
// Array.smooth() that hydra-synth fixed in PR #157.
export const SAMPLE_PROPS = [
  { time: 0, bpm: 30 },
  { time: 0.016, bpm: 30 },
  { time: 0.4, bpm: 30 },
  { time: 0.5, bpm: 60 },
  { time: 1.75, bpm: 144 },
  { time: 12.34, bpm: 99 },
];

/** Resolve a compiled uniform into plain comparable data: static values pass
 * through, zero-arg thunks (textures) are invoked once, and dynamic
 * (context, props) functions are sampled over SAMPLE_PROPS. */
export function resolveUniform(value: unknown) {
  if (typeof value === 'function') {
    if (value.length === 0) {
      return { kind: 'thunk', value: (value as () => unknown)() };
    }
    return {
      kind: 'dynamic',
      samples: SAMPLE_PROPS.map((props) =>
        (value as (context: unknown, props: unknown) => unknown)(
          undefined,
          props,
        ),
      ),
    };
  }
  return { kind: 'static', value };
}

export function expectEquivalentUniforms(
  tsUniforms: Record<string, unknown>,
  upstreamUniforms: Record<string, unknown>,
) {
  expect(Object.keys(tsUniforms).sort()).toEqual(
    Object.keys(upstreamUniforms).sort(),
  );

  for (const name of Object.keys(upstreamUniforms)) {
    expect(resolveUniform(tsUniforms[name]), `uniform ${name}`).toEqual(
      resolveUniform(upstreamUniforms[name]),
    );
  }
}
