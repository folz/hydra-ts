import { Webcam } from './lib/Webcam.js';
import { Screen } from './lib/Screen.js';
import { Texture2D, Texture2DOptions, TextureImageData } from 'regl';
import { GlEnvironment, Synth } from './Hydra.js';

export class Source {
  environment: GlEnvironment;
  src?: TextureImageData;
  dynamic: boolean;
  tex: Texture2D;
  // identity for debugging/inspection ('s0', 's1', ...), like hydra-synth's
  readonly label: string;

  constructor(environment: GlEnvironment, label = '') {
    this.environment = environment;
    this.label = label;
    this.src = undefined;
    this.dynamic = true;
    this.tex = environment.regl.texture({
      shape: [1, 1],
    });
  }

  // `params` is forwarded to regl.texture() on every init* method, matching
  // hydra-synth — e.g. s0.initCam(0, { min: 'linear', mag: 'linear' })
  // enables smooth texture filtering.
  init = (
    opts: { src?: Source['src']; dynamic?: boolean },
    params?: Texture2DOptions,
  ) => {
    if ('src' in opts) {
      this.src = opts.src;
      this.tex = this.environment.regl.texture({
        data: this.src,
        ...params,
      } as Texture2DOptions);
    }

    if ('dynamic' in opts && opts.dynamic !== undefined) {
      this.dynamic = opts.dynamic;
    }
  };

  initCam = (index: number, params?: Texture2DOptions) => {
    Webcam(index)
      .then((video) => {
        this.src = video;
        this.dynamic = true;
        this.tex = this.environment.regl.texture({
          data: video,
          ...params,
        } as Texture2DOptions);
      })
      .catch((err) => console.log('could not get camera', err));
  };

  initVideo = (url = '', params?: Texture2DOptions) => {
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.autoplay = true;
    vid.loop = true;
    // mute in order to load without user interaction
    vid.muted = true;
    vid.addEventListener('loadeddata', () => {
      this.src = vid;
      vid.play();
      this.tex = this.environment.regl.texture({
        data: this.src,
        ...params,
      } as Texture2DOptions);
      this.dynamic = true;
    });
    vid.src = url;
  };

  initImage = (url = '', params?: Texture2DOptions) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.src = img;
      this.dynamic = false;
      this.tex = this.environment.regl.texture({
        data: this.src,
        ...params,
      } as Texture2DOptions);
    };
  };

  // index is only relevant in atom-hydra + desktop apps; accepted for
  // signature parity with hydra-synth
  initScreen = (_index = 0, params?: Texture2DOptions) => {
    Screen()
      .then((video) => {
        this.src = video;
        this.tex = this.environment.regl.texture({
          data: this.src,
          ...params,
        } as Texture2DOptions);
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
