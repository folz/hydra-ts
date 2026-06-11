import {
  DefaultContext,
  DrawCommand,
  DynamicVariable,
  DynamicVariableFn,
  Regl,
  Resource,
} from 'regl';
import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
import { solid } from './glsl';

export type Precision = 'lowp' | 'mediump' | 'highp';

export type Resolution = readonly [number, number];

export interface HydraFboUniforms {
  resolution: Resolution;
  tex0: Resource;
}

export interface HydraQuadUniforms {
  tex0: Resource;
  tex1: Resource;
  tex2: Resource;
  tex3: Resource;
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
  // user-defined callbacks, run before and after each rendered frame
  update?: (dt: number) => void;
  afterUpdate?: (dt: number) => void;
}

export interface GlEnvironment {
  defaultUniforms: {
    [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
  };
  height: number;
  precision: Precision;
  regl: Regl;
  width: number;
}

interface HydraRendererOptions {
  height: number;
  numOutputs?: number;
  numSources?: number;
  precision?: Precision;
  regl: Regl;
  width: number;
}

export class Hydra {
  readonly loop: Loop;
  readonly synth: Synth;
  readonly outputs: Output[];
  readonly sources: Source[];
  #output: Output;
  #isRenderingAll = false;
  readonly #renderFbo: DrawCommand<DefaultContext>;
  readonly #renderAll?: DrawCommand<DefaultContext>;
  #timeSinceLastUpdate = 0;

  constructor({
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump',
    regl,
    width,
  }: HydraRendererOptions) {
    const outputs = [];
    const sources = [];

    const synth: Synth = {
      bpm: 30,
      fps: undefined,
      resolution: [width, height],
      speed: 1,
      stats: {
        fps: 0,
      },
      time: 0,
    };

    const defaultUniforms = {
      time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
      resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
        'resolution',
      ),
    };

    const glEnvironment = {
      regl,
      width,
      height,
      precision,
      defaultUniforms,
    };

    const vert = `
      precision ${glEnvironment.precision} float;
      attribute vec2 position;
      varying vec2 uv;

      void main () {
        uv = position;
        gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
      }`;

    const attributes = {
      position: [
        [-2, 0],
        [0, -2],
        [2, 2],
      ],
    };

    const renderFbo = regl<HydraFboUniforms>({
      frag: `
      precision ${glEnvironment.precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
      vert,
      attributes,
      uniforms: {
        tex0: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>('tex0'),
        resolution: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>(
          'resolution',
        ),
      },
      count: 3,
      depth: { enable: false },
    });

    // matches hydra-synth's render() with no arguments: tile the first four
    // outputs in a 2x2 grid. Only available when there are at least four
    // outputs.
    const renderAll =
      numOutputs >= 4
        ? regl<HydraQuadUniforms>({
            frag: `
      precision ${glEnvironment.precision} float;
      varying vec2 uv;
      uniform sampler2D tex0;
      uniform sampler2D tex1;
      uniform sampler2D tex2;
      uniform sampler2D tex3;

      void main () {
        vec2 st = vec2(1.0 - uv.x, uv.y);
        st*= vec2(2);
        vec2 q = floor(st).xy*(vec2(2.0, 1.0));
        int quad = int(q.x) + int(q.y);
        st.x += step(1., mod(st.y,2.0));
        st.y += step(1., mod(st.x,2.0));
        st = fract(st);
        if(quad==0){
          gl_FragColor = texture2D(tex0, st);
        } else if(quad==1){
          gl_FragColor = texture2D(tex1, st);
        } else if (quad==2){
          gl_FragColor = texture2D(tex2, st);
        } else {
          gl_FragColor = texture2D(tex3, st);
        }

      }
      `,
            vert,
            attributes,
            uniforms: {
              tex0: regl.prop<HydraQuadUniforms, 'tex0'>('tex0'),
              tex1: regl.prop<HydraQuadUniforms, 'tex1'>('tex1'),
              tex2: regl.prop<HydraQuadUniforms, 'tex2'>('tex2'),
              tex3: regl.prop<HydraQuadUniforms, 'tex3'>('tex3'),
            },
            count: 3,
            depth: { enable: false },
          })
        : undefined;

    for (let i = 0; i < numSources; i++) {
      const s = new Source(glEnvironment, `s${i}`);
      sources.push(s);
    }

    for (let i = 0; i < numOutputs; i++) {
      const o = new Output(glEnvironment, `o${i}`);
      outputs.push(o);
    }

    this.loop = new Loop(this.tick);
    this.outputs = outputs;
    this.sources = sources;
    this.synth = synth;
    this.#output = outputs[0];
    this.#renderFbo = renderFbo;
    this.#renderAll = renderAll;
  }

  hush = () => {
    this.sources.forEach((source) => {
      source.clear();
    });
    this.outputs.forEach((output) => {
      solid(0, 0, 0, 0).out(output);
    });
    this.render(this.outputs[0]);
    this.synth.update = undefined;
    this.synth.afterUpdate = undefined;
  };

  setResolution = (width: number, height: number) => {
    this.synth.resolution = [width, height];

    this.outputs.forEach((output) => {
      output.resize(width, height);
    });
  };

  render = (output?: Output) => {
    if (output) {
      this.#output = output;
      this.#isRenderingAll = false;
    } else if (this.#renderAll) {
      this.#isRenderingAll = true;
    } else {
      this.#output = this.outputs[0];
      this.#isRenderingAll = false;
    }
  };

  // dt in ms
  tick = (dt: number) => {
    this.synth.time += dt * 0.001 * this.synth.speed;

    this.#timeSinceLastUpdate += dt;

    if (!this.synth.fps || this.#timeSinceLastUpdate >= 1000 / this.synth.fps) {
      this.synth.stats.fps = Math.ceil(1000 / this.#timeSinceLastUpdate);

      if (this.synth.update) {
        try {
          this.synth.update(this.#timeSinceLastUpdate);
        } catch (e) {
          console.log(e);
        }
      }

      this.sources.forEach((source) => {
        source.draw(this.synth);
      });

      this.outputs.forEach((output) => {
        output.draw(this.synth);
      });

      if (this.#isRenderingAll && this.#renderAll) {
        this.#renderAll({
          tex0: this.outputs[0].getCurrent(),
          tex1: this.outputs[1].getCurrent(),
          tex2: this.outputs[2].getCurrent(),
          tex3: this.outputs[3].getCurrent(),
        });
      } else {
        this.#renderFbo({
          tex0: this.#output.getCurrent(),
          resolution: this.synth.resolution,
        });
      }

      if (this.synth.afterUpdate) {
        try {
          this.synth.afterUpdate(this.#timeSinceLastUpdate);
        } catch (e) {
          console.log(e);
        }
      }

      this.#timeSinceLastUpdate = 0;
    }
  };
}
