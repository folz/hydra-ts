import { TransformApplication } from '../../GlslSource';
export declare const shift: {
    readonly name: "shift";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "r";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "g";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "b";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "a";
        readonly default: 0;
    }];
    readonly glsl: "   vec4 c2 = vec4(_c0);\n   c2.r = fract(c2.r + r);\n   c2.g = fract(c2.g + g);\n   c2.b = fract(c2.b + b);\n   c2.a = fract(c2.a + a);\n   return vec4(c2.rgba);";
};
export declare const Shift: (r?: number, g?: number, b?: number, a?: number) => TransformApplication;
