import { processGlsl } from '../../GeneratorFactory';
import { TransformApplication } from '../../GlslSource';

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
} as const;

export const Pixelate = (
  pixelX: number = 20,
  pixelY: number = 20,
): TransformApplication => {
  return {
    precision: 'mediump',
    transform: processGlsl(pixelate),
    userArgs: [pixelX, pixelY],
  };
};
