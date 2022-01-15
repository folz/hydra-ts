import { Attributes, DrawCommand, Framebuffer2D } from 'regl';
import { GlEnvironment } from './Hydra';
import { TransformApplication } from './glsl/Glsl';
import { compileWithContext } from './compiler/compileWithContext';

export class Output {
  attributes: Attributes;
  draw: DrawCommand;
  fbos: Framebuffer2D[];
  glEnvironment: GlEnvironment;
  vert: string;
  pingPongIndex = 0;

  constructor(glEnvironment: GlEnvironment) {
    const { regl } = glEnvironment;
    this.glEnvironment = glEnvironment;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.draw = () => {};

    this.vert = `
  precision ${glEnvironment.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`;

    this.attributes = {
      position: regl.buffer([
        [-2, 0],
        [0, -2],
        [2, 2],
      ]),
    };

    // for each output, create two fbos for pingponging
    this.fbos = Array(2)
      .fill(undefined)
      .map(() =>
        regl.framebuffer({
          color: regl.texture({
            mag: 'nearest',
            width: glEnvironment.width,
            height: glEnvironment.height,
            format: 'rgba',
          }),
          depthStencil: false,
        }),
      );
  }

  resize(width: number, height: number) {
    this.fbos.forEach((fbo) => {
      fbo.resize(width, height);
    });
  }

  getCurrent() {
    return this.fbos[this.pingPongIndex];
  }

  // Used by glsl-utils/formatArguments
  getTexture() {
    const index = this.pingPongIndex ? 0 : 1;
    return this.fbos[index];
  }

  render(transformApplications: TransformApplication[]) {
    if (transformApplications.length === 0) {
      return;
    }

    const pass = compileWithContext(transformApplications, {
      defaultUniforms: this.glEnvironment.defaultUniforms,
      precision: this.glEnvironment.precision,
    });

    this.draw = this.glEnvironment.regl({
      frag: pass.frag,
      vert: this.vert,
      attributes: this.attributes,
      uniforms: pass.uniforms,
      count: 3,
      framebuffer: () => {
        this.pingPongIndex = this.pingPongIndex ? 0 : 1;
        return this.fbos[this.pingPongIndex];
      },
    });
  }
}
