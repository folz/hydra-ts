import { TransformApplication } from '../../GlslSource';
export declare const invert: {
    readonly name: "invert";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);";
};
export declare const Invert: (amount?: number) => TransformApplication;
