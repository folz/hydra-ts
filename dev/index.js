import REGL from 'regl';
import tinykeys from 'tinykeys';
import Hydra from '../index';
import jelly from './image3A3853_Glitch.jpg';
import './style.css';
const WIDTH = 1080;
const HEIGHT = 1080;
const canvas = document.createElement('canvas');
canvas.style.backgroundColor = '#000000';
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);
const regl = REGL(canvas);
const hydra = new Hydra({
    width: WIDTH,
    height: HEIGHT,
    precision: 'highp',
    regl,
});
const { src, solid, o0, o1, s0, render } = hydra.synth;
s0.initImage(jelly);
const base = src(s0)
    .rotate(0.1, 0.05)
    .scrollX(0.1, -0.05)
    .koch(2, 12)
    .koch(1, 12)
    .rotate(Math.PI / 6)
    .rotate(Math.PI / 2)
    .luma(0.3);
base.out(o0);
const shader = src(o0).mult(solid(), 0.1).layer(base, 0.6);
shader.out(o1);
render(o1);
const debugLog = document.createElement('pre');
const frag = shader.glsl()[0].frag;
debugLog.innerText = frag;
document.body.appendChild(debugLog);
tinykeys(window, {
    'Alt+Space': (event) => {
        hydra.loop.toggle();
    },
});
