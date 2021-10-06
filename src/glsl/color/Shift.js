import { processGlsl } from '../../GeneratorFactory';
export const shift = {
    name: 'shift',
    type: 'color',
    inputs: [
        {
            type: 'float',
            name: 'r',
            default: 0.5,
        },
        {
            type: 'float',
            name: 'g',
            default: 0,
        },
        {
            type: 'float',
            name: 'b',
            default: 0,
        },
        {
            type: 'float',
            name: 'a',
            default: 0,
        },
    ],
    glsl: `   vec4 c2 = vec4(_c0);
   c2.r = fract(c2.r + r);
   c2.g = fract(c2.g + g);
   c2.b = fract(c2.b + b);
   c2.a = fract(c2.a + a);
   return vec4(c2.rgba);`,
};
export const Shift = (r = 0.5, g = 0.5, b = 0.5, a = 0) => {
    return {
        name: shift.name,
        transform: processGlsl(shift),
        precision: 'mediump',
        userArgs: [r, g, b, a],
    };
};
