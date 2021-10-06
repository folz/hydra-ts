import { TransformApplication } from '../../GlslSource';
export declare const posterize: {
    readonly name: "posterize";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "bins";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "gamma";
        readonly default: 0.6;
    }];
    readonly glsl: "   vec4 c2 = pow(_c0, vec4(gamma));\n   c2 *= vec4(bins);\n   c2 = floor(c2);\n   c2/= vec4(bins);\n   c2 = pow(c2, vec4(1.0/gamma));\n   return vec4(c2.xyz, _c0.a);";
};
export declare const Posterize: (bins?: number, gamma?: number) => TransformApplication;
