import { Output } from './src/output';
import { Loop } from './src/loop';
import { HydraSource } from './src/hydra-source';
import { VideoRecorder } from './src/lib/video-recorder';
import ArrayUtils from './src/lib/array-utils';
import { EvalSandbox } from './src/eval-sandbox';
import { GeneratorFactory } from './src/generator-factory';
// to do: add ability to pass in certain uniforms and transforms
export class HydraRenderer {
    constructor({ pb = null, width = 1280, height = 720, numSources = 4, numOutputs = 4, makeGlobal = true, autoLoop = true, detectAudio = true, enableStreamCapture = true, precision, regl, }) {
        this.isRenderingAll = false;
        this.s = [];
        this.o = [];
        this.hush = () => {
            this.s.forEach((source) => {
                source.clear();
            });
            this.o.forEach((output) => {
                this.synth.solid(1, 1, 1, 0).out(output);
            });
        };
        this.setResolution = (width, height) => {
            this.regl._gl.canvas.width = width;
            this.regl._gl.canvas.height = height;
            this.width = width;
            this.height = height;
            this.o.forEach((output) => {
                output.resize(width, height);
            });
            this.s.forEach((source) => {
                source.resize(width, height);
            });
            this.regl._refresh();
            console.log(this.regl._gl.canvas.width);
        };
        this._render = (output) => {
            if (output) {
                this.output = output;
                this.isRenderingAll = false;
            }
            else {
                this.isRenderingAll = true;
            }
        };
        // dt in ms
        this.tick = (dt) => {
            this.sandbox.tick();
            if (this.synth.update) {
                try {
                    this.synth.update(dt);
                }
                catch (e) {
                    console.log(e);
                }
            }
            this.sandbox.set('time', (this.synth.time += dt * 0.001 * this.synth.speed));
            this.timeSinceLastUpdate += dt;
            if (!this.synth.fps || this.timeSinceLastUpdate >= 1000 / this.synth.fps) {
                this.synth.stats.fps = Math.ceil(1000 / this.timeSinceLastUpdate);
                for (let i = 0; i < this.s.length; i++) {
                    this.s[i].tick(this.synth.time);
                }
                for (let i = 0; i < this.o.length; i++) {
                    this.o[i].tick({
                        time: this.synth.time,
                        bpm: this.synth.bpm,
                        resolution: [this.regl._gl.canvas.width, this.regl._gl.canvas.height],
                    });
                }
                if (this.isRenderingAll && this.renderAll) {
                    this.renderAll({
                        tex0: this.o[0].getCurrent(),
                        tex1: this.o[1].getCurrent(),
                        tex2: this.o[2].getCurrent(),
                        tex3: this.o[3].getCurrent(),
                        resolution: [this.regl._gl.canvas.width, this.regl._gl.canvas.height],
                    });
                }
                else {
                    this.renderFbo({
                        tex0: this.output.getCurrent(),
                        resolution: [this.regl._gl.canvas.width, this.regl._gl.canvas.height],
                    });
                }
                this.timeSinceLastUpdate = 0;
            }
            if (this.saveFrame) {
                this.canvasToImage();
                this.saveFrame = false;
            }
        };
        ArrayUtils.init();
        this.pb = pb;
        this.width = width;
        this.height = height;
        this.renderAll = false;
        this.detectAudio = detectAudio;
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
            render: this._render,
            setResolution: this.setResolution,
            update: () => { },
            hush: this.hush,
        };
        this.timeSinceLastUpdate = 0;
        this._time = 0; // for internal use, only to use for deciding when to render frames
        if (precision) {
            this.precision = precision;
        }
        else {
            let isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
                // @ts-ignore
                !window.MSStream;
            this.precision = isIOS ? 'highp' : 'mediump';
        }
        // boolean to store when to save screenshot
        this.saveFrame = false;
        // if stream capture is enabled, this object contains the capture stream
        this.captureStream = null;
        this.generator = undefined;
        this._initRegl();
        this._initOutputs(numOutputs);
        this._initSources(numSources);
        this._generateGlslTransforms();
        this.synth.screencap = () => {
            this.saveFrame = true;
        };
        if (enableStreamCapture) {
            try {
                this.captureStream = this.regl._gl.canvas.captureStream(25);
                // to do: enable capture stream of specific sources and outputs
                this.synth.vidRecorder = new VideoRecorder(this.captureStream);
            }
            catch (e) {
                console.warn('[hydra-synth warning]\nnew MediaSource() is not currently supported on iOS.');
                console.error(e);
            }
        }
        this.loop = new Loop(this.tick);
        if (autoLoop) {
            this.loop.start();
        }
        // final argument is properties that the user can set, all others are treated as read-only
        this.sandbox = new EvalSandbox(this.synth, makeGlobal, ['speed', 'update', 'bpm', 'fps']);
    }
    canvasToImage() {
        const a = document.createElement('a');
        a.style.display = 'none';
        let d = new Date();
        a.download = `hydra-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}.${d.getMinutes()}.${d.getSeconds()}.png`;
        document.body.appendChild(a);
        const self = this;
        this.regl._gl.canvas.toBlob((blob) => {
            if (self.imageCallback) {
                self.imageCallback(blob);
                delete self.imageCallback;
            }
            else {
                a.href = URL.createObjectURL(blob);
                console.log(a.href);
                a.click();
            }
        }, 'image/png');
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 300);
    }
    _initRegl() {
        // This clears the color buffer to black and the depth buffer to 1
        this.regl.clear({
            color: [0, 0, 0, 1],
        });
        this.renderAll = this.regl({
            frag: `
      precision ${this.precision} float;
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
                tex0: this.regl.prop('tex0'),
                tex1: this.regl.prop('tex1'),
                tex2: this.regl.prop('tex2'),
                tex3: this.regl.prop('tex3'),
            },
            count: 3,
            depth: { enable: false },
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
                tex0: this.regl.prop('tex0'),
                resolution: this.regl.prop('resolution'),
            },
            count: 3,
            depth: { enable: false },
        });
    }
    _initOutputs(numOutputs) {
        const self = this;
        this.o = Array(numOutputs)
            .fill(undefined)
            .map((el, index) => {
            const o = new Output({
                regl: this.regl,
                width: this.width,
                height: this.height,
                precision: this.precision,
            });
            //  o.render()
            o.id = index;
            self.synth['o' + index] = o;
            return o;
        });
        // set default output
        this.output = this.o[0];
    }
    _initSources(numSources) {
        this.s = [];
        for (let i = 0; i < numSources; i++) {
            this.createSource(i);
        }
    }
    createSource(i) {
        let s = new HydraSource({
            regl: this.regl,
            pb: this.pb,
            width: this.width,
            height: this.height,
        });
        this.synth['s' + this.s.length] = s;
        this.s.push(s);
        return s;
    }
    _generateGlslTransforms() {
        const self = this;
        this.generator = new GeneratorFactory({
            defaultOutput: this.o[0],
            defaultUniforms: this.o[0].uniforms,
            changeListener: ({ type, method, synth, }) => {
                if (type === 'add') {
                    self.synth[method] = synth.generators[method];
                    if (self.sandbox)
                        self.sandbox.add(method);
                }
                else if (type === 'remove') {
                    // what to do here? dangerously deleting window methods
                    //delete window[method]
                }
                //  }
            },
        });
        this.synth.setFunction = this.generator.setFunction;
    }
}
