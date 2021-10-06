import REGL from 'regl';
import tinykeys from 'tinykeys';
import Hydra from '../index';
import * as space from '../src/glsl/space';
import * as color from '../src/glsl/color';
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
const { src, solid, o0, o1, s0, render } = hydra.synth;
s0.initImage(jelly);
const shader = src(s0)
    // .scrollX(0.01, 0.01)
    // .scrollY(0.01, 0.01)
    .then(space.Rotate(0.1, -0.05), space.Scale([1, 2].ease('easeInOutCubic')), color.Shift(1, 0, 1));
// .koch(1, 4)
// .koch(0.5, 5)
// .modulateRepeat(osc(2))
// .rotate((Math.PI * 5) / 6),
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
