import { processGlsl } from '../../GeneratorFactory';
export const pixelate = {
    name: 'pixelate',
    type: 'coord',
    inputs: [
        {
            type: 'float',
            name: 'pixelX',
            default: 20,
        },
        {
            type: 'float',
            name: 'pixelY',
            default: 20,
        },
    ],
    glsl: `   vec2 xy = vec2(pixelX, pixelY);
   return (floor(_st * xy) + 0.5)/xy;`,
};
export const Pixelate = (pixelX = 20, pixelY = 20) => {
    return {
        name: pixelate.name,
        precision: 'mediump',
        transform: processGlsl(pixelate),
        userArgs: [pixelX, pixelY],
    };
};
