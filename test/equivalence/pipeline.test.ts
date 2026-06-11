/**
 * Render-pipeline equivalence: beyond shader strings, the regl draw commands
 * must be wired the same way as hydra-synth's for outputs to match —
 * same vertex shader, same fullscreen-triangle attributes, same ping-pong
 * framebuffer behavior, same prevBuffer uniform, and the same final
 * canvas-blit (renderFbo) and quad-view (renderAll) shaders.
 *
 * regl is stubbed: both sides only need it to record the configuration of
 * the commands they create.
 */
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

// @ts-ignore - untyped upstream javascript
import UpstreamOutput from '../../node_modules/hydra-synth/src/output.js';

import { Output } from '../../src/Output';
import { Hydra, GlEnvironment } from '../../src/Hydra';
import { buildUpstream, buildHydraTs, makeContext, PRECISION } from './helpers';

const WIDTH = 320;
const HEIGHT = 240;

interface StubRegl {
  (config: Record<string, any>): (props?: unknown) => void;
  commands: Array<Record<string, any>>;
  buffer: (data: unknown) => unknown;
  texture: (opts: unknown) => unknown;
  framebuffer: (opts: any) => unknown;
  prop: (name: string) => string;
}

function makeStubRegl(): StubRegl {
  const stub = ((config: Record<string, any>) => {
    stub.commands.push(config);
    return () => {};
  }) as StubRegl;
  stub.commands = [];
  stub.buffer = (data: unknown) => ({ kind: 'buffer', data });
  stub.texture = (opts: unknown) => ({ kind: 'texture', opts });
  stub.framebuffer = (opts: any) => ({
    kind: 'framebuffer',
    opts,
    resize: () => {},
  });
  stub.prop = (name: string) => `prop:${name}`;
  return stub;
}

function makeUpstreamOutput(regl: StubRegl) {
  return new UpstreamOutput({
    regl,
    precision: PRECISION,
    label: 'o0',
    width: WIDTH,
    height: HEIGHT,
  });
}

function makeHydraTsOutput(regl: StubRegl) {
  return new Output({
    regl,
    precision: PRECISION,
    width: WIDTH,
    height: HEIGHT,
    defaultUniforms: {
      time: regl.prop('time'),
      resolution: regl.prop('resolution'),
    },
  } as unknown as GlEnvironment);
}

describe('Output', () => {
  test('framebuffer construction matches upstream', () => {
    const upstreamRegl = makeStubRegl();
    const tsRegl = makeStubRegl();
    const upstream = makeUpstreamOutput(upstreamRegl);
    const ours = makeHydraTsOutput(tsRegl);

    expect(ours.fbos.length).toBe(upstream.fbos.length);
    expect(JSON.stringify(ours.fbos)).toBe(JSON.stringify(upstream.fbos));
  });

  test('ping-pong semantics match upstream', () => {
    // exercise getCurrent/getTexture against the same index state machine
    for (const output of [
      makeUpstreamOutput(makeStubRegl()),
      makeHydraTsOutput(makeStubRegl()) as any,
    ]) {
      expect(output.pingPongIndex).toBe(0);
      expect(output.getCurrent()).toBe(output.fbos[0]);
      expect(output.getTexture()).toBe(output.fbos[1]);
      output.pingPongIndex = 1;
      expect(output.getCurrent()).toBe(output.fbos[1]);
      expect(output.getTexture()).toBe(output.fbos[0]);
    }
  });

  test('render() creates an equivalent draw command', () => {
    const ctx = makeContext();

    // compile the same sketch on both sides
    const upstreamSide = buildUpstream();
    const tsSide = buildHydraTs();
    const build = (g: any) => g.osc(12, 0.05, 0.7).rotate(0.3);

    const upstreamRegl = makeStubRegl();
    const upstreamOutput = makeUpstreamOutput(upstreamRegl);
    upstreamOutput.render([
      upstreamSide.compile(build(upstreamSide.generators)),
    ]);

    const tsRegl = makeStubRegl();
    const tsOutput = makeHydraTsOutput(tsRegl);
    tsOutput.render(build(tsSide.generators).transforms.toArray());

    const upstreamCommand = upstreamRegl.commands.at(-1)!;
    const tsCommand = tsRegl.commands.at(-1)!;

    expect(tsCommand.frag).toBe(upstreamCommand.frag);
    expect(tsCommand.vert).toBe(upstreamCommand.vert);
    expect(tsCommand.count).toBe(upstreamCommand.count);
    expect(JSON.stringify(tsCommand.attributes)).toBe(
      JSON.stringify(upstreamCommand.attributes),
    );

    expect(Object.keys(tsCommand.uniforms).sort()).toEqual(
      Object.keys(upstreamCommand.uniforms).sort(),
    );

    // ping-pong framebuffer thunk: flips the index and returns the fbo now
    // being rendered into; prevBuffer returns the most recently rendered fbo
    for (const [command, output] of [
      [upstreamCommand, upstreamOutput],
      [tsCommand, tsOutput],
    ] as const) {
      expect(command.uniforms.prevBuffer()).toBe(output.fbos[0]);
      expect(command.framebuffer()).toBe(output.fbos[1]);
      expect(command.uniforms.prevBuffer()).toBe(output.fbos[1]);
      expect(command.framebuffer()).toBe(output.fbos[0]);
      expect(command.uniforms.prevBuffer()).toBe(output.fbos[0]);
    }
  });
});

describe('Hydra final-pass shaders', () => {
  // hydra-synth builds these commands inside HydraRenderer._initRegl, which
  // cannot run without a browser; extract the shader templates from its
  // source instead.
  const upstreamSource = readFileSync(
    new URL(
      '../../node_modules/hydra-synth/src/hydra-synth.js',
      import.meta.url,
    ),
    'utf8',
  );

  function extractUpstreamShaders(marker: string) {
    const start = upstreamSource.indexOf(marker);
    expect(start).toBeGreaterThan(-1);
    const slice = upstreamSource.slice(start);
    const frag = /frag: `([\s\S]*?)`/.exec(slice);
    const vert = /vert: `([\s\S]*?)`/.exec(slice);
    expect(frag).not.toBeNull();
    expect(vert).not.toBeNull();
    return {
      frag: frag![1].replaceAll('${this.precision}', PRECISION),
      vert: vert![1].replaceAll('${this.precision}', PRECISION),
    };
  }

  function makeHydraCommands() {
    const regl = makeStubRegl();
    new Hydra({ regl: regl as any, width: WIDTH, height: HEIGHT });
    const renderFbo = regl.commands.find(
      (c) =>
        typeof c.frag === 'string' &&
        c.frag.includes('uniform sampler2D tex0;') &&
        !c.frag.includes('tex3'),
    );
    const renderAll = regl.commands.find(
      (c) => typeof c.frag === 'string' && c.frag.includes('tex3'),
    );
    expect(renderFbo).toBeDefined();
    expect(renderAll).toBeDefined();
    return { renderFbo: renderFbo!, renderAll: renderAll! };
  }

  test('renderFbo (canvas blit) shaders match upstream', () => {
    const upstream = extractUpstreamShaders('this.renderFbo = this.regl(');
    const { renderFbo } = makeHydraCommands();
    expect(renderFbo.frag).toBe(upstream.frag);
    expect(renderFbo.vert).toBe(upstream.vert);
    expect(renderFbo.count).toBe(3);
    expect(renderFbo.depth).toEqual({ enable: false });
  });

  test('renderAll (2x2 quad view) shaders match upstream', () => {
    const upstream = extractUpstreamShaders('this.renderAll = this.regl(');
    const { renderAll } = makeHydraCommands();
    expect(renderAll.frag).toBe(upstream.frag);
    expect(renderAll.vert).toBe(upstream.vert);
    expect(renderAll.count).toBe(3);
    expect(renderAll.depth).toEqual({ enable: false });
  });
});
