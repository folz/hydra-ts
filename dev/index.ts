import REGL from 'regl';
import Hydra from '../index';

const canvas = document.createElement('canvas');
canvas.style.backgroundColor = '#000000';
canvas.width = 1080;
canvas.height = 1080;
document.body.appendChild(canvas);

const regl = REGL(canvas);

const hydra = new Hydra({
  width: 1080,
  height: 1080,
  detectAudio: false,
  regl,
});

const shader = osc().layer(
  shape()
    .scroll(
      () => mouse.x / width,
      () => mouse.y / height
    )
    .mask(
      shape().scroll(
        () => mouse.x / width,
        () => mouse.y / height
      )
    )
    .kaleid(4)
);

shader.out();

const debugLog = document.createElement('pre');
const frag = shader.glsl()[0].frag;
debugLog.innerText = frag;
document.body.appendChild(debugLog);
