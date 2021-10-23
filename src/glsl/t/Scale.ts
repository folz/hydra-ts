import { processGlsl } from '../../GeneratorFactory';
import { TransformApplication } from '../../GlslSource';

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
} as const;

export const Scale = (
  amount: number = 1.5,
  xMult: number = 1,
  yMult: number = 1,
  offsetX: number = 0.5,
  offsetY: number = 0.5,
): TransformApplication => {
  return {
    name: scale.name,
    precision: 'mediump',
    transform: processGlsl(scale),
    userArgs: [amount, xMult, yMult, offsetX, offsetY],
  };
};
