"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shader_generator_1 = __importDefault(require("./../shader-generator"));
const shader = new shader_generator_1.default();
let x = shader.eval('osc().out()');
console.log(x.frag, x.uniforms);
let y = shader.eval(`
    let myFunc = () => 4
    osc(myFunc).out()
`);
console.log(y.frag, y.uniforms);
//
// let z = shader.eval(`
//     src(s0).out()
// `)
// console.log(z.frag, z.uniforms)
