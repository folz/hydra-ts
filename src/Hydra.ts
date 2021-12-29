import { DefaultContext, DrawCommand, Regl, Resource } from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
import { solid } from './glsl';

export type Precision = 'lowp' | 'mediump' | 'highp';

export type Resolution = [number, number];

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
export class Hydra {
  loop: Loop;
  output: Output;
  precision: Precision;
  regl: Regl;
  renderFbo: DrawCommand<DefaultContext, HydraFboUniforms>;
  synth: Synth;
  timeSinceLastUpdate: number;
  outputs: Output[] = [];
  sources: Source[] = [];

  constructor({
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump',
    regl,
    width,
  }: HydraRendererOptions) {
    this.regl = regl;

    // object that contains all properties that will be made available on the global context and during local evaluation
    this.synth = {
      bpm: 30,
      fps: undefined,
      resolution: [width, height],
      speed: 1,
      stats: {
        fps: 0,
      },
      time: 0,
    };

    this.timeSinceLastUpdate = 0;

    const defaultUniforms = {
      time: this.regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
      resolution: this.regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
        'resolution',
      ),
    };

    this.precision = precision;

    // This clears the color buffer to black and the depth buffer to 1
    this.regl.clear({
      color: [0, 0, 0, 1],
    });

    this.renderFbo = this.regl({
      frag: `
      precision ${this.precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
      vert: `
      precision ${this.precision} float;
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
        tex0: this.regl.prop<HydraFboUniforms, keyof HydraFboUniforms>('tex0'),
        resolution: this.regl.prop<HydraFboUniforms, keyof HydraFboUniforms>(
          'resolution',
        ),
      },
      count: 3,
      depth: { enable: false },
    });

    for (let i = 0; i < numSources; i++) {
      let s = new Source({
        regl: this.regl,
      });
      this.sources.push(s);
    }

    for (let i = 0; i < numOutputs; i++) {
      const o = new Output({
        regl: this.regl,
        width,
        height,
        precision: this.precision,
        defaultUniforms,
      });
      this.outputs.push(o);
    }

    this.output = this.outputs[0];

    this.loop = new Loop(this.tick);
  }

  hush = () => {
    this.outputs.forEach((output) => {
      solid(1, 1, 1, 0).out(output);
    });
  };

  setResolution = (width: number, height: number) => {
    this.synth.resolution = [width, height];

    this.outputs.forEach((output) => {
      output.resize(width, height);
    });
  };

  render = (output?: Output) => {
    this.output = output ?? this.outputs[0];
  };

  // dt in ms
  tick = (dt: number) => {
    this.synth.time += dt * 0.001 * this.synth.speed;

    this.timeSinceLastUpdate += dt;

    if (!this.synth.fps || this.timeSinceLastUpdate >= 1000 / this.synth.fps) {
      this.synth.stats.fps = Math.ceil(1000 / this.timeSinceLastUpdate);

      this.sources.forEach((source) => {
        source.tick(this.synth);
      });

      this.outputs.forEach((output) => {
        output.tick(this.synth);
      });

      this.renderFbo({
        tex0: this.output.getCurrent(),
        resolution: this.synth.resolution,
      });

      this.timeSinceLastUpdate = 0;
    }
  };
}
