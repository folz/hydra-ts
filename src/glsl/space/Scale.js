import { processGlsl } from '../../GeneratorFactory';
export const scale = {
    name: 'scale',
    type: 'coord',
    inputs: [
        {
            type: 'float',
            name: 'amount',
            default: 1.5,
        },
        {
            type: 'float',
            name: 'xMult',
            default: 1,
        },
        {
            type: 'float',
            name: 'yMult',
            default: 1,
        },
        {
            type: 'float',
            name: 'offsetX',
            default: 0.5,
        },
        {
            type: 'float',
            name: 'offsetY',
            default: 0.5,
        },
    ],
    glsl: `   vec2 xy = _st - vec2(offsetX, offsetY);
   xy*=(1.0/vec2(amount*xMult, amount*yMult));
   xy+=vec2(offsetX, offsetY);
   return xy;
   `,
};
export const Scale = (amount = 1.5, xMult = 1, yMult = 1, offsetX = 0.5, offsetY = 0.5) => {
    return {
        name: scale.name,
        precision: 'mediump',
        transform: processGlsl(scale),
        userArgs: [amount, xMult, yMult, offsetX, offsetY],
    };
};
