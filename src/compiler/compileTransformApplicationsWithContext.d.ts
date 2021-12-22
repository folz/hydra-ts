import { Precision } from "../../HydraRenderer";
import { GlslSource, TransformApplication } from "../GlslSource";
interface TransformApplicationContext {
    defaultUniforms: GlslSource['defaultUniforms'];
    precision: Precision;
}
export declare function compileTransformApplicationsWithContext(transformApplications: TransformApplication[], context: TransformApplicationContext): {
    frag: string;
    uniforms: {
        [x: string]: string | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | import("regl").Uniform | undefined;
    };
};
export {};
