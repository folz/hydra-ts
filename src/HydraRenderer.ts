import { DefaultContext, DrawCommand, Regl, Resource } from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
import { solid } from './glsl';

export type Precision = 'lowp' | 'mediump' | 'highp';

export type Resolution = [number, number];

export interface HydraFboUniforms {
  tex0: Resource;
  resolution: Resolution;
}

export interface HydraDrawUniforms {
  time: number;
  resolution: Resolution;
}

export interface Synth {
  time: number;
  bpm: number;
  width: number;
  height: number;
  fps?: number;
  stats: {
    fps: number;
  };
  speed: number;
  render: (output?: Output) => void;
  setResolution: (width: number, height: number) => void;
  hush: () => void;
  sources: Source[];
  outputs: Output[];
}

interface HydraRendererOptions {
  width?: number;
  height?: number;
  numSources?: number;
  numOutputs?: number;
  regl: Regl;
  precision?: Precision;
}

// to do: add ability to pass in certain uniforms and transforms
export class HydraRenderer {
  width: number;
  height: number;
  synth: Synth;
  timeSinceLastUpdate: number;
  precision: Precision;
  regl: Regl;
  renderFbo: DrawCommand<DefaultContext, HydraFboUniforms>;
  output: Output;
  loop: Loop;

  constructor({
    width = 1280,
    height = 720,
    numSources = 4,
    numOutputs = 4,
    precision = 'mediump',
    regl,
  }: HydraRendererOptions) {
    this.width = width;
    this.height = height;

    this.regl = regl;

    // object that contains all properties that will be made available on the global context and during local evaluation
    this.synth = {
      time: 0,
      bpm: 30,
      width: this.width,
      height: this.height,
      fps: undefined,
      stats: {
        fps: 0,
      },
      speed: 1,
      render: this.render,
      setResolution: this.setResolution,
      hush: this.hush,
      sources: [],
      outputs: [],
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
      this.synth.sources.push(s);
    }

    for (let i = 0; i < numOutputs; i++) {
      const o = new Output({
        regl: this.regl,
        width: this.width,
        height: this.height,
        precision: this.precision,
        defaultUniforms,
      });
      this.synth.outputs.push(o);
    }

    this.output = this.synth.outputs[0];

    this.loop = new Loop(this.tick);
  }

  hush = () => {
    this.synth.outputs.forEach((output) => {
      solid(1, 1, 1, 0).out(output);
    });
  };

  setResolution = (width: number, height: number) => {
    this.regl._gl.canvas.width = width;
    this.regl._gl.canvas.height = height;

    this.width = width;
    this.height = height;

    this.synth.outputs.forEach((output) => {
      output.resize(width, height);
    });

    this.regl._refresh();
  };

  render = (output?: Output) => {
    this.output = output ?? this.synth.outputs[0];
  };

  // dt in ms
  tick = (dt: number) => {
    this.synth.time += dt * 0.001 * this.synth.speed;

    this.timeSinceLastUpdate += dt;

    if (!this.synth.fps || this.timeSinceLastUpdate >= 1000 / this.synth.fps) {
      this.synth.stats.fps = Math.ceil(1000 / this.timeSinceLastUpdate);

      this.synth.sources.forEach((source) => {
        source.tick(this.synth.time);
      });

      this.synth.outputs.forEach((output) => {
        output.tick({
          time: this.synth.time,
          bpm: this.synth.bpm,
          resolution: [this.regl._gl.canvas.width, this.regl._gl.canvas.height],
        });
      });

      this.renderFbo({
        tex0: this.output.getCurrent(),
        resolution: [this.regl._gl.canvas.width, this.regl._gl.canvas.height],
      });

      this.timeSinceLastUpdate = 0;
    }
  };
}
