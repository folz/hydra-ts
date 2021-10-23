import { processGlsl } from '../../GeneratorFactory';
export const posterize = {
    name: 'posterize',
    type: 'color',
    inputs: [
        {
            type: 'float',
            name: 'bins',
            default: 3,
        },
        {
            type: 'float',
            name: 'gamma',
            default: 0.6,
        },
    ],
    glsl: `   vec4 c2 = pow(_c0, vec4(gamma));
   c2 *= vec4(bins);
   c2 = floor(c2);
   c2/= vec4(bins);
   c2 = pow(c2, vec4(1.0/gamma));
   return vec4(c2.xyz, _c0.a);`,
};
export const Posterize = (bins = 3, gamma = 0.6) => {
    return {
        name: posterize.name,
        precision: 'mediump',
        transform: processGlsl(posterize),
        userArgs: [bins, gamma],
    };
};
