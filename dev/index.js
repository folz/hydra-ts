import REGL from 'regl';
import tinykeys from 'tinykeys';
import Hydra from '../index';
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
const { generators, sources, outputs, render } = hydra.synth;
const [s0, s1, s2, s3] = sources;
const [o0, o1, o2, o3] = outputs;
const { src, osc, gradient, shape, voronoi, noise } = generators;
window.hydra = hydra;
window.src = src;
const shader = osc(() => 10 * Math.PI)
    .add(o0, 0.5)
    .mult(src(o0).rotate(Math.PI / 2), 0.5);
shader.out(o0);
render(o0);
// const debugLog = document.createElement('pre');
// const frag = shader.glsl()[0].frag;
// debugLog.innerText = frag;
// document.body.appendChild(debugLog);
tinykeys(window, {
    'Alt+Space': (event) => {
        hydra.loop.toggle();
    },
});
