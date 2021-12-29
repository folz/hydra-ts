import { Output } from './Output';
import { Loop } from './Loop';
import { Source } from './Source';
import { createGenerators } from './glsl/createGenerators';
import { generatorTransforms, modifierTransforms, } from './glsl/transformDefinitions';
// to do: add ability to pass in certain uniforms and transforms
export class HydraRenderer {
    constructor({ width = 1280, height = 720, numSources = 4, numOutputs = 4, precision = 'mediump', regl, }) {
        this.hush = () => {
            this.synth.outputs.forEach((output) => {
                // TODO - should reset output directly without relying on synth
                this.synth.generators.solid(1, 1, 1, 0).out(output);
            });
        };
        this.setResolution = (width, height) => {
            this.regl._gl.canvas.width = width;
            this.regl._gl.canvas.height = height;
            this.width = width;
            this.height = height;
            this.synth.sources.forEach((source) => {
                source.resize(width, height);
            });
            this.synth.outputs.forEach((output) => {
                output.resize(width, height);
            });
            this.regl._refresh();
        };
        this.render = (output) => {
            this.output = output !== null && output !== void 0 ? output : this.synth.outputs[0];
        };
        // dt in ms
        this.tick = (dt) => {
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
            generators: {},
        };
        this.timeSinceLastUpdate = 0;
        const defaultUniforms = {
            // @ts-ignore
            time: this.regl.prop('time'),
            // @ts-ignore
            resolution: this.regl.prop('resolution'),
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
                // @ts-ignore
                tex0: this.regl.prop('tex0'),
                // @ts-ignore
                resolution: this.regl.prop('resolution'),
            },
            count: 3,
            depth: { enable: false },
        });
        for (let i = 0; i < numSources; i++) {
            let s = new Source({
                regl: this.regl,
                width: this.width,
                height: this.height,
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
        this.synth.generators = createGenerators({
            generatorTransforms,
            modifierTransforms,
        });
        this.loop = new Loop(this.tick);
    }
}
