import { processGlsl } from '../../GeneratorFactory';
import { TransformApplication } from '../../GlslSource';

export const rotate = {
  name: 'rotate',
  type: 'coord' as const,
  inputs: [
    {
      type: 'float',
      name: 'angle',
      default: 10,
    },
    {
      type: 'float',
      name: 'speed',
      default: 0,
    },
  ],
  glsl: `   vec2 xy = _st - vec2(0.5);
   float ang = angle + speed *time;
   xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
   xy += 0.5;
   return xy;`,
} as const;

export const Rotate = (
  angle: number = 10,
  speed: number = 0,
): TransformApplication => {
  return {
    name: rotate.name,
    precision: 'mediump',
    transform: processGlsl(rotate),
    userArgs: [angle, speed],
  };
};
