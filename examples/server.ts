import HydraShaders from './../shader-generator';
const shader = new HydraShaders();

let x = shader.eval('osc().out()');
// @ts-ignore
console.log(x.frag, x.uniforms);

let y = shader.eval(`
    let myFunc = () => 4
    osc(myFunc).out()
`);
// @ts-ignore
console.log(y.frag, y.uniforms);
//
// let z = shader.eval(`
//     src(s0).out()
// `)
// console.log(z.frag, z.uniforms)
