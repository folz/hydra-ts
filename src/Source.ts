import { Webcam } from './lib/Webcam';
import { Screen } from './lib/Screen';
import { Texture2D, TextureImageData } from 'regl';
import { GlEnvironment, Synth } from './Hydra';

export class Source {
  environment: GlEnvironment;
  src?: TextureImageData;
  dynamic: boolean;
  tex: Texture2D;

  constructor(environment: GlEnvironment) {
    this.environment = environment;
    this.src = undefined;
    this.dynamic = true;
    this.tex = environment.regl.texture({
      shape: [1, 1],
    });
  }

  init = (opts: { src: Source['src']; dynamic: boolean }) => {
    if (opts.src) {
      this.src = opts.src;
      this.tex = this.environment.regl.texture(this.src);
    }

    if (opts.dynamic) {
      this.dynamic = opts.dynamic;
    }
  };

  initCam = (index: number) => {
    Webcam(index)
      .then((video) => {
        this.src = video;
        this.dynamic = true;
        this.tex = this.environment.regl.texture(video);
      })
      .catch((err) => console.log('could not get camera', err));
  };

  initVideo = (url = '') => {
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.autoplay = true;
    vid.loop = true;
    // mute in order to load without user interaction
    vid.muted = true;
    vid.addEventListener('loadeddata', () => {
      this.src = vid;
      vid.play();
      this.tex = this.environment.regl.texture(this.src);
      this.dynamic = true;
    });
    vid.src = url;
  };

  initImage = (url = '') => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.src = img;
      this.dynamic = false;
      this.tex = this.environment.regl.texture(this.src);
    };
  };

  initScreen = () => {
    Screen()
      .then((video) => {
        this.src = video;
        this.tex = this.environment.regl.texture(this.src);
        this.dynamic = true;
      })
      .catch((err) => console.log('could not get screen', err));
  };

  // cached canvas context, so we don't create a new canvas every time
  #canvasCtx?: CanvasRenderingContext2D;

  // Creates a canvas, registers it as this source's input, and returns its
  // 2d context for drawing
  initCanvas = (width = 1000, height = 1000) => {
    if (this.#canvasCtx === undefined) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx != null) {
        this.#canvasCtx = ctx;
      }
    }

    const ctx = this.#canvasCtx;
    if (ctx === undefined) {
      return undefined;
    }

    const canvas = ctx.canvas;
    // resize when either dimension changes (upstream requires both to
    // change, which leaves the canvas at the old size if only one differs)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    } else {
      ctx.clearRect(0, 0, width, height);
    }
    this.init({ src: canvas, dynamic: true });

    return ctx;
  };

  clear = () => {
    if (this.src && 'srcObject' in this.src && this.src.srcObject) {
      if ('getTracks' in this.src.srcObject && this.src.srcObject.getTracks) {
        this.src.srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    }
    this.src = undefined;
    this.tex = this.environment.regl.texture({ shape: [1, 1] });
  };

  draw = (_props: Synth) => {
    if (this.src && this.dynamic) {
      if (
        'videoWidth' in this.src &&
        this.src.videoWidth &&
        this.src.videoWidth !== this.tex.width
      ) {
        this.tex.resize(this.src.videoWidth, this.src.videoHeight);
      }

      if (
        'width' in this.src &&
        this.src.width &&
        this.src.width !== this.tex.width
      ) {
        this.tex.resize(this.src.width, this.src.height);
      }

      this.tex.subimage(this.src);
    }
  };

  // Used by glsl-utils/formatArguments
  getTexture = () => {
    return this.tex;
  };
}
