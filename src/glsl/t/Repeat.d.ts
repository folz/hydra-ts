import { TransformApplication } from '../../GlslSource';
export declare const repeat: {
    readonly name: "repeat";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "repeatX";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "repeatY";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offsetX";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "offsetY";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 st = _st * vec2(repeatX, repeatY);\n   st.x += step(1., mod(st.y,2.0)) * offsetX;\n   st.y += step(1., mod(st.x,2.0)) * offsetY;\n   return fract(st);";
};
export declare const Repeat: (repeatX?: number, repeatY?: number, offsetX?: number, offsetY?: number) => TransformApplication;
