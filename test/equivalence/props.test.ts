/**
 * The `props` option merges user-supplied values into the per-frame props
 * that sources, outputs, and dynamic uniforms receive — hydra-ts's
 * dependency-injected equivalent of hydra-synth passing `mouse` to every
 * draw.
 */
import { describe, expect, test, vi } from 'vitest';

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

describe('Hydra props option', () => {
  test('draws receive synth values merged with user props', () => {
    const mouse = { x: 42, y: 7 };
    const hydra = new Hydra({
      regl: makeStubRegl(),
      width: 320,
      height: 240,
      props: () => ({ mouse }),
    });

    const sourceDraw = vi.fn();
    const outputDraw = vi.fn();
    hydra.sources[0].draw = sourceDraw;
    hydra.outputs[0].draw = outputDraw as any;

    hydra.tick(16);

    for (const draw of [sourceDraw, outputDraw]) {
      expect(draw).toHaveBeenCalledTimes(1);
      const props = draw.mock.calls[0][0];
      expect(props.mouse).toBe(mouse);
      expect(props.time).toBe(hydra.synth.time);
      expect(props.bpm).toBe(hydra.synth.bpm);
      expect(props.resolution).toEqual([320, 240]);
    }
  });

  test('props callback runs once per rendered frame', () => {
    const props = vi.fn(() => ({ frameValue: 1 }));
    const hydra = new Hydra({
      regl: makeStubRegl(),
      width: 320,
      height: 240,
      props,
    });

    hydra.tick(16);
    hydra.tick(16);

    expect(props).toHaveBeenCalledTimes(2);
  });

  test('without the option, draws receive the synth object itself', () => {
    const hydra = new Hydra({ regl: makeStubRegl(), width: 320, height: 240 });

    const sourceDraw = vi.fn();
    hydra.sources[0].draw = sourceDraw;

    hydra.tick(16);

    expect(sourceDraw.mock.calls[0][0]).toBe(hydra.synth);
  });
});
