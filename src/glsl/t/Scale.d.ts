import { TransformApplication } from '../../GlslSource';
export declare const scale: {
    readonly name: "scale";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1.5;
    }, {
        readonly type: "float";
        readonly name: "xMult";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "yMult";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offsetX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "offsetY";
        readonly default: 0.5;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(offsetX, offsetY);\n   xy*=(1.0/vec2(amount*xMult, amount*yMult));\n   xy+=vec2(offsetX, offsetY);\n   return xy;\n   ";
};
export declare const Scale: (amount?: number, xMult?: number, yMult?: number, offsetX?: number, offsetY?: number) => TransformApplication;
