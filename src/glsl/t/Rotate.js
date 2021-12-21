import { processGlsl } from '../../GeneratorFactory';
export const rotate = {
    name: 'rotate',
    type: 'coord',
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
};
export const Rotate = (angle = 10, speed = 0) => {
    return {
        precision: 'mediump',
        transform: processGlsl(rotate),
        userArgs: [angle, speed],
    };
};
