import { Attributes, Buffer, DrawCommand, Framebuffer2D, Regl, Uniforms } from 'regl';
import { Precision } from '../hydra-synth';
import { CompiledTransform } from './glsl-source';

interface OutputOptions {
  regl: Output['regl'];
  precision: Output['precision'];
  width: number;
  height: number;
}

export class Output {
  regl: Regl;
  precision: Precision;
  positionBuffer: Buffer;
  draw: DrawCommand;
  pingPongIndex: number;
  fbos: Framebuffer2D[];
  transformIndex: number = 0;
  fragHeader: string = '';
  fragBody: string = '';
  frag: string = '';
  vert: string = '';
  uniforms: Uniforms = {};
  attributes: Attributes = {};

  constructor({ regl, precision, width, height }: OutputOptions) {
    this.regl = regl;
    this.precision = precision;
    this.positionBuffer = this.regl.buffer([
      [-2, 0],
      [0, -2],
      [2, 2],
    ]);

    // @ts-ignore
    this.draw = () => {};
    this.init();
    this.pingPongIndex = 0;

    // for each output, create two fbos for pingponging
    this.fbos = Array(2)
      .fill(undefined)
      .map(() =>
        this.regl.framebuffer({
          color: this.regl.texture({
            mag: 'nearest',
            width: width,
            height: height,
            format: 'rgba',
          }),
          depthStencil: false,
        }),
      );

    // array containing render passes
    //  this.passes = []  }
  }

  resize(width: number, height: number) {
    this.fbos.forEach((fbo) => {
      fbo.resize(width, height);
    });
  }

  getCurrent() {
    return this.fbos[this.pingPongIndex];
  }

  getTexture() {
    const index = this.pingPongIndex ? 0 : 1;
    return this.fbos[index];
  }

  init() {
    this.transformIndex = 0;
    this.fragHeader = `
  precision ${this.precision} float;

  uniform float time;
  varying vec2 uv;
  `;

    this.fragBody = ``;

    this.vert = `
  precision ${this.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`;

    this.attributes = {
      position: this.positionBuffer,
    };
    this.uniforms = {
      // @ts-ignore
      time: this.regl.prop('time'),
      // @ts-ignore
      resolution: this.regl.prop('resolution'),
    };

    this.frag = `
       ${this.fragHeader}

      void main () {
        vec4 c = vec4(0, 0, 0, 0);
        vec2 st = uv;
        ${this.fragBody}
        gl_FragColor = c;
      }
  `;
    return this;
  }

  render(passes: CompiledTransform[]) {
    let pass = passes[0];
    const uniforms = Object.assign(pass.uniforms, {
      prevBuffer: () => {
        //var index = this.pingPongIndex ? 0 : 1
        //   var index = self.pingPong[(passIndex+1)%2]
        //  console.log('ping pong', self.pingPongIndex)
        return this.fbos[this.pingPongIndex];
      },
    });

    this.draw = this.regl({
      frag: pass.frag,
      vert: this.vert,
      attributes: this.attributes,
      uniforms: uniforms,
      count: 3,
      framebuffer: () => {
        this.pingPongIndex = this.pingPongIndex ? 0 : 1;
        return this.fbos[this.pingPongIndex];
      },
    });
  }

  tick(props: {}) {
    this.draw(props);
  }
}
