import REGL from 'regl';
import tinykeys from 'tinykeys';
import Hydra from '../index';
import * as t from '../src/glsl/t';
// @ts-ignore
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
    precision: 'mediump',
    regl,
});
hydra.loop.start();
const { osc, src, solid, o0, o1, s0, render } = hydra.synth;
s0.initImage(jelly);
// prettier-ignore
const shader = osc(12, 0.1, Math.PI / 2)
    .do(t.Rotate())
    .scrollX(0.01, 0.01)
    .scrollY(0.01, 0.01)
    .do(t.Posterize(12 * Math.PI), t.Invert())
    .pixelate(12 * Math.PI)
    .koch(1, 4)
    .koch(0.5, 5)
    .modulateRepeat(osc(2))
    .rotate((Math.PI * 5) / 6);
shader.out(o0);
render(o0);
const debugLog = document.createElement('pre');
const frag = shader.glsl()[0].frag;
debugLog.innerText = frag;
document.body.appendChild(debugLog);
tinykeys(window, {
    'Alt+Space': (event) => {
        hydra.loop.toggle();
    },
});
