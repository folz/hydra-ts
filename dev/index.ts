import REGL from 'regl';
import tinykeys from 'tinykeys';
import Hydra from '../index';
import * as generators from '../src/glsl';
import ArrayUtils from '../src/lib/array-utils';

import './style.css';

const WIDTH = 1080;
const HEIGHT = 1080;

ArrayUtils.init();

const canvas = document.createElement('canvas');
canvas.style.backgroundColor = '#000000';
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);

const regl = REGL(canvas);

const hydra = new Hydra({
  width: WIDTH,
  height: HEIGHT,
  precision: 'mediump',
  regl,
});

hydra.loop.start();

const { sources, outputs, render } = hydra;
const [s0, s1, s2, s3] = sources;
const [o0, o1, o2, o3] = outputs;
const { src, osc, gradient, shape, voronoi, noise } = generators;

osc(() => 4 * Math.PI)
  .add(o0, [0, 0.5].smooth())
  .mult(src(o0).rotate(Math.PI / 2), 0.6)
  .out(o0);

src(o0).scrollX(0.1, -0.1).scrollY(0.1, -0.1).out(o1);

render(o1);

// const debugLog = document.createElement('pre');
// const frag = shader.glsl()[0].frag;
// debugLog.innerText = frag;
// document.body.appendChild(debugLog);

tinykeys(window, {
  'Alt+Space': (event) => {
    hydra.loop.toggle();
  },
});
