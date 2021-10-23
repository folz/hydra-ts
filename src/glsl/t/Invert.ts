import { TransformApplication } from '../../GlslSource';
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
} as const;

export const Invert = (amount: number = 1): TransformApplication => {
  return {
    name: invert.name,
    precision: 'mediump',
    transform: processGlsl(invert),
    userArgs: [amount],
  };
};
