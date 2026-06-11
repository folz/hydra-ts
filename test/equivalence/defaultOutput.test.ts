/**
 * Instance-bound generators: hydra.generators chains default to the
 * instance's first output, matching hydra-synth's defaultOutput behavior —
 * without any global state. The module-level generators stay
 * environment-free and require an explicit output.
 */
import { describe, expect, test } from 'vitest';

import { Hydra } from '../../src/Hydra';
import * as moduleGenerators from '../../src/glsl';
import { osc } from '../../src/glsl';
import { compileGlsl } from '../../src/compiler/compileWithEnvironment';
import { Glsl } from '../../src/glsl/Glsl';

function makeStubRegl() {
  const stub: any = (config: Record<string, unknown>) => {
    stub.commands.push(config);
    return () => {};
  };
  stub.commands = [] as Array<Record<string, unknown>>;
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

function makeHydra() {
  const regl = makeStubRegl();
  const hydra = new Hydra({ regl, width: 320, height: 240 });
  return { hydra, regl };
}

describe('hydra.generators', () => {
  test('exposes the same generator names as the module-level export', () => {
    const { hydra } = makeHydra();
    expect(Object.keys(hydra.generators).sort()).toEqual(
      Object.keys(moduleGenerators).sort(),
    );
  });

  test('.out() with no argument renders to the first output', () => {
    const { hydra } = makeHydra();
    const before = hydra.outputs[0].draw;

    hydra.generators.osc(10).out();

    expect(hydra.outputs[0].draw).not.toBe(before);
  });

  test('default output survives chaining through modifiers', () => {
    const { hydra } = makeHydra();
    const before = hydra.outputs[0].draw;

    (hydra.generators.osc(10) as any).rotate(0.3).kaleid(4).out();

    expect(hydra.outputs[0].draw).not.toBe(before);
  });

  test('.out(output) still targets the given output', () => {
    const { hydra } = makeHydra();
    const before0 = hydra.outputs[0].draw;
    const before1 = hydra.outputs[1].draw;

    hydra.generators.osc(10).out(hydra.outputs[1]);

    expect(hydra.outputs[0].draw).toBe(before0);
    expect(hydra.outputs[1].draw).not.toBe(before1);
  });

  test('bound chains compile to the same shader as unbound chains', () => {
    const { hydra } = makeHydra();

    const bound = (hydra.generators.osc(13, 0.2) as any).rotate(0.4) as Glsl;
    const unbound = (osc(13, 0.2) as any).rotate(0.4) as Glsl;

    expect(compileGlsl(bound.transforms.toArray()).fragColor).toBe(
      compileGlsl(unbound.transforms.toArray()).fragColor,
    );
  });
});

describe('module-level generators', () => {
  test('.out() with no argument throws a descriptive error', () => {
    expect(() => osc(10).out()).toThrow('.out() was called without an output');
  });
});
