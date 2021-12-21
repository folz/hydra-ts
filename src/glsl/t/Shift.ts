import { processGlsl } from '../../GeneratorFactory';
import { TransformApplication } from '../../GlslSource';

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
} as const;

export const Shift = (
  r: number = 0.5,
  g: number = 0.5,
  b: number = 0.5,
  a: number = 0,
): TransformApplication => {
  return {
    transform: processGlsl(shift),
    precision: 'mediump',
    userArgs: [r, g, b, a],
  };
};
