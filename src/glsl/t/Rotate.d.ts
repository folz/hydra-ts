import { TransformApplication } from '../../GlslSource';
export declare const rotate: {
    readonly name: "rotate";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "angle";
        readonly default: 10;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(0.5);\n   float ang = angle + speed *time;\n   xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;\n   xy += 0.5;\n   return xy;";
};
export declare const Rotate: (angle?: number, speed?: number) => TransformApplication;
