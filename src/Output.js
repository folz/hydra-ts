export class Output {
    constructor({ regl, precision, width, height }) {
        this.pingPongIndex = 0;
        this.regl = regl;
        this.precision = precision;
        this.positionBuffer = this.regl.buffer([
            [-2, 0],
            [0, -2],
            [2, 2],
        ]);
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
            position: this.positionBuffer,
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
        // array containing render passes
        //  this.passes = []  }
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
    render(passes) {
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
    tick(props) {
        this.draw(props);
    }
}
