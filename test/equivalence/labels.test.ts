/**
 * Sources and outputs carry identity labels ('s0', 'o1', ...) like
 * hydra-synth's, for debugging and inspection.
 */
import { describe, expect, test } from 'vitest';

import { Hydra } from '../../src/Hydra';
import { Output } from '../../src/Output';
import { Source } from '../../src/Source';
import { GlEnvironment } from '../../src/Hydra';

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

describe('labels', () => {
  test('Hydra labels its sources and outputs like hydra-synth', () => {
    const hydra = new Hydra({ regl: makeStubRegl(), width: 320, height: 240 });

    expect(hydra.sources.map((s) => s.label)).toEqual(['s0', 's1', 's2', 's3']);
    expect(hydra.outputs.map((o) => o.label)).toEqual(['o0', 'o1', 'o2', 'o3']);
  });

  test('labels follow numSources/numOutputs', () => {
    const hydra = new Hydra({
      regl: makeStubRegl(),
      width: 320,
      height: 240,
      numSources: 2,
      numOutputs: 6,
    });

    expect(hydra.sources.map((s) => s.label)).toEqual(['s0', 's1']);
    expect(hydra.outputs.at(-1)!.label).toBe('o5');
  });

  test("directly-constructed instances default to '', like upstream", () => {
    const environment = { regl: makeStubRegl() } as unknown as GlEnvironment;
    expect(new Source(environment).label).toBe('');
    expect(new Output(environment).label).toBe('');
  });
});
