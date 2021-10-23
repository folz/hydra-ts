import { processGlsl } from '../../GeneratorFactory';
import { TransformApplication } from '../../GlslSource';

export const repeat = {
  name: 'repeat',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'repeatX',
      default: 3,
    },
    {
      type: 'float',
      name: 'repeatY',
      default: 3,
    },
    {
      type: 'float',
      name: 'offsetX',
      default: 0,
    },
    {
      type: 'float',
      name: 'offsetY',
      default: 0,
    },
  ],
  glsl: `   vec2 st = _st * vec2(repeatX, repeatY);
   st.x += step(1., mod(st.y,2.0)) * offsetX;
   st.y += step(1., mod(st.x,2.0)) * offsetY;
   return fract(st);`,
} as const;

export const Repeat = (
  repeatX: number = 3,
  repeatY: number = 3,
  offsetX: number = 0,
  offsetY: number = 0,
): TransformApplication => {
  return {
    name: repeat.name,
    precision: 'mediump',
    transform: processGlsl(repeat),
    userArgs: [repeatX, repeatY, offsetX, offsetY],
  };
};
