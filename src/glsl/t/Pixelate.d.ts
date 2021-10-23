import { TransformApplication } from '../../GlslSource';
export declare const pixelate: {
    readonly name: "pixelate";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "pixelX";
        readonly default: 20;
    }, {
        readonly type: "float";
        readonly name: "pixelY";
        readonly default: 20;
    }];
    readonly glsl: "   vec2 xy = vec2(pixelX, pixelY);\n   return (floor(_st * xy) + 0.5)/xy;";
};
export declare const Pixelate: (pixelX?: number, pixelY?: number) => TransformApplication;
