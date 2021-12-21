import { processGlsl } from '../../GeneratorFactory';
export const invert = {
    name: 'invert',
    type: 'color',
    inputs: [
        {
            type: 'float',
            name: 'amount',
            default: 1,
        },
    ],
    glsl: `   return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);`,
};
export const Invert = (amount = 1) => {
    return {
        precision: 'mediump',
        transform: processGlsl(invert),
        userArgs: [amount],
    };
};
