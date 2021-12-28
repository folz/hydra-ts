import { compileWithContext } from './compiler/compileWithContext';
export class Output {
    constructor({ defaultUniforms, height, precision, regl, width, }) {
        this.pingPongIndex = 0;
        this.regl = regl;
        this.defaultUniforms = defaultUniforms;
        this.precision = precision;
        // @ts-ignore
        this.draw = () => { };
        this.vert = `
  precision ${this.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`;
        this.attributes = {
            position: this.regl.buffer([
                [-2, 0],
                [0, -2],
                [2, 2],
            ]),
        };
        // for each output, create two fbos for pingponging
        this.fbos = Array(2)
            .fill(undefined)
            .map(() => this.regl.framebuffer({
            color: this.regl.texture({
                mag: 'nearest',
                width: width,
                height: height,
                format: 'rgba',
            }),
            depthStencil: false,
        }));
    }
    resize(width, height) {
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
    render(transformApplications) {
        if (transformApplications.length === 0) {
            return;
        }
        let pass = compileWithContext(transformApplications, {
            defaultUniforms: this.defaultUniforms,
            precision: this.precision,
        });
        this.draw = this.regl({
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
    tick(props) {
        this.draw(props);
    }
}
