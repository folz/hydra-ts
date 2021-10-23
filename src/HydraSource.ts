import { Webcam } from './lib/Webcam';
import { Screen } from './lib/Screen';
import { Regl, Texture2D, TextureImageData } from 'regl';

interface HydraSourceOptions {
  regl: HydraSource['regl'];
  width: HydraSource['width'];
  height: HydraSource['height'];
}

export class HydraSource {
  regl: Regl;
  width: number;
  height: number;
  src?: TextureImageData;
  dynamic: boolean;
  tex: Texture2D;

  constructor({ regl, width, height }: HydraSourceOptions) {
    this.regl = regl;
    this.src = undefined;
    this.dynamic = true;
    this.width = width;
    this.height = height;
    this.tex = this.regl.texture({
      //  shape: [width, height]
      shape: [1, 1],
    });
  }

  init(opts: { src: HydraSource['src']; dynamic: boolean }) {
    if (opts.src) {
      this.src = opts.src;
      this.tex = this.regl.texture(this.src);
    }
    if (opts.dynamic) this.dynamic = opts.dynamic;
  }

  initCam(index: number) {
    Webcam(index)
      .then((response) => {
        this.src = response.video;
        this.dynamic = true;
        this.tex = this.regl.texture(response.video);
      })
      .catch((err) => console.log('could not get camera', err));
  }

  initVideo(url = '') {
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
  }

  initImage(url = '') {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.src = img;
      this.dynamic = false;
      this.tex = this.regl.texture(this.src);
    };
  }

  initScreen() {
    Screen()
      .then((response) => {
        this.src = response.video;
        this.tex = this.regl.texture(this.src);
        this.dynamic = true;
      })
      .catch((err) => console.log('could not get screen', err));
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  clear() {
    if (this.src && 'srcObject' in this.src && this.src.srcObject) {
      if ('getTracks' in this.src.srcObject && this.src.srcObject.getTracks) {
        this.src.srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    }
    this.src = undefined;
    this.tex = this.regl.texture({ shape: [1, 1] });
  }

  tick(dt?: number) {
    if (this.src && this.dynamic) {
      if ('videoWidth' in this.src && this.src.videoWidth !== this.tex.width) {
        this.tex.resize(this.src.videoWidth, this.src.videoHeight);
      }

      if ('width' in this.src && this.src.width !== this.tex.width) {
        this.tex.resize(this.src.width, this.src.height);
      }

      this.tex.subimage(this.src);
    }
  }

  // Used by glsl-utils/formatArguments
  getTexture() {
    return this.tex;
  }
}
