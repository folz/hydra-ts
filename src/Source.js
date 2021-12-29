import { Webcam } from './lib/Webcam';
import { Screen } from './lib/Screen';
export class Source {
    constructor({ regl }) {
        this.init = (opts) => {
            if (opts.src) {
                this.src = opts.src;
                this.tex = this.regl.texture(this.src);
            }
            if (opts.dynamic) {
                this.dynamic = opts.dynamic;
            }
        };
        this.initCam = (index) => {
            Webcam(index)
                .then((video) => {
                this.src = video;
                this.dynamic = true;
                this.tex = this.regl.texture(video);
            })
                .catch((err) => console.log('could not get camera', err));
        };
        this.initVideo = (url = '') => {
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.autoplay = true;
            vid.loop = true;
            // mute in order to load without user interaction
            vid.muted = true;
            vid.addEventListener('loadeddata', () => {
                this.src = vid;
                vid.play();
                this.tex = this.regl.texture(this.src);
                this.dynamic = true;
            });
            vid.src = url;
        };
        this.initImage = (url = '') => {
            const img = document.createElement('img');
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => {
                this.src = img;
                this.dynamic = false;
                this.tex = this.regl.texture(this.src);
            };
        };
        this.initScreen = () => {
            Screen()
                .then((video) => {
                this.src = video;
                this.tex = this.regl.texture(this.src);
                this.dynamic = true;
            })
                .catch((err) => console.log('could not get screen', err));
        };
        this.clear = () => {
            if (this.src && 'srcObject' in this.src && this.src.srcObject) {
                if ('getTracks' in this.src.srcObject && this.src.srcObject.getTracks) {
                    this.src.srcObject
                        .getTracks()
                        .forEach((track) => track.stop());
                }
            }
            this.src = undefined;
            this.tex = this.regl.texture({ shape: [1, 1] });
        };
        this.tick = (dt) => {
            if (this.src && this.dynamic) {
                if ('videoWidth' in this.src &&
                    this.src.videoWidth &&
                    this.src.videoWidth !== this.tex.width) {
                    this.tex.resize(this.src.videoWidth, this.src.videoHeight);
                }
                if ('width' in this.src &&
                    this.src.width &&
                    this.src.width !== this.tex.width) {
                    this.tex.resize(this.src.width, this.src.height);
                }
                this.tex.subimage(this.src);
            }
        };
        // Used by glsl-utils/formatArguments
        this.getTexture = () => {
            return this.tex;
        };
        this.regl = regl;
        this.src = undefined;
        this.dynamic = true;
        this.tex = this.regl.texture({
            shape: [1, 1],
        });
    }
}
