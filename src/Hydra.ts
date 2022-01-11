import { DefaultContext, DrawCommand, Regl, Resource } from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
import { solid } from './glsl';
import produce from 'immer';
import { store } from './store';

export type Precision = 'lowp' | 'mediump' | 'highp';

export type Resolution = readonly [number, number];

export interface HydraFboUniforms {
  resolution: Resolution;
  tex0: Resource;
}

export interface HydraDrawUniforms {
  resolution: Resolution;
  time: number;
}

export interface Synth {
  bpm: number;
  fps?: number;
  resolution: Resolution;
  speed: number;
  stats: {
    fps: number;
  };
  time: number;
}

interface HydraRendererOptions {
  height: number;
  numOutputs?: number;
  numSources?: number;
  precision?: Precision;
  regl: Regl;
  width: number;
}

// to do: add ability to pass in certain uniforms and transforms
interface Environment {
  loop: Loop;
  output: Output;
  precision: Precision;
  regl: Regl;
  renderFbo: DrawCommand<DefaultContext, HydraFboUniforms>;
  synth: Synth;
  timeSinceLastUpdate: number;
  outputs: Output[];
  sources: Source[];
}

// dt in ms
function tick(
  dt: number,
  synth: Synth,
  sources: Source[],
  outputs: Output[],
  environment: Environment,
) {
  synth.time += dt * 0.001 * synth.speed;

  environment.timeSinceLastUpdate += dt;

  if (!synth.fps || environment.timeSinceLastUpdate >= 1000 / synth.fps) {
    synth.stats.fps = Math.ceil(1000 / environment.timeSinceLastUpdate);

    sources.forEach((source) => {
      source.draw(synth);
    });

    outputs.forEach((output) => {
      output.draw(synth);
    });

    environment.renderFbo({
      tex0: environment.output.getCurrent(),
      resolution: synth.resolution,
    });

    environment.timeSinceLastUpdate = 0;
  }
}

// function update(synth: Synth, environment: Environment, dt: number) {
//   synth.time += dt * 0.001 * synth.speed;
//
//   environment.timeSinceLastUpdate += dt;
// }

export function createHydra(options: HydraRendererOptions): Environment {
  const {
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump',
    regl,
    width,
  } = options;

  const state = store.getState();

  const outputs: Output[] = [];
  const sources: Source[] = [];

  const defaultUniforms = {
    time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
    resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
      'resolution',
    ),
  };

  regl.clear({
    color: [0, 0, 0, 1],
  });

  const renderFbo = regl({
    frag: `
      precision ${precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
    vert: `
      precision ${precision} float;
      attribute vec2 position;
      varying vec2 uv;

      void main () {
        uv = position;
        gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
      }`,
    attributes: {
      position: [
        [-2, 0],
        [0, -2],
        [2, 2],
      ],
    },
    uniforms: {
      tex0: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>('tex0'),
      resolution: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>(
        'resolution',
      ),
    },
    count: 3,
    depth: { enable: false },
  });

  for (let i = 0; i < numSources; i++) {
    const s = new Source({
      regl: regl,
    });
    sources.push(s);
  }

  for (let i = 0; i < numOutputs; i++) {
    const o = new Output({
      regl: regl,
      width,
      height,
      precision: precision,
      defaultUniforms,
    });
    outputs.push(o);
  }

  const output = outputs[0];

  const environment = state;
  const { synth } = environment;

  const commands = {
    hush(outputs: Output[]) {
      outputs.forEach((output) => {
        solid(1, 1, 1, 0).out(output);
      });
    },
    render(environment: Environment, output: Output): Environment {
      return produce<Environment>(environment, (draft) => {
        draft.output = output ?? draft.outputs[0];
      });
    },
    setResolution(
      width: number,
      height: number,
      synth: Synth,
      outputs: Output[],
    ) {
      synth.resolution = [width, height];

      outputs.forEach((output) => {
        output.resize(width, height);
      });
    },
    tick(dt: number) {
      return tick(dt, synth, sources, outputs, environment);
    },
  };

  return environment;
}
