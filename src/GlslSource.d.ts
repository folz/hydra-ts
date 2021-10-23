import { Uniforms } from 'regl';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { Output } from './Output';
import { Precision } from '../HydraRenderer';
export interface TransformApplication {
    defaultUniforms?: GlslSource['defaultUniforms'];
    name: string;
    precision: Precision;
    transform: ProcessedTransformDefinition;
    userArgs: any[];
}
export declare type CompiledTransform = ReturnType<GlslSource['compile']>;
export declare class GlslSource {
    defaultUniforms?: Uniforms;
    precision: Precision;
    transforms: TransformApplication[];
    constructor(obj: TransformApplication);
    static createTransformOnPrototype: (cls: typeof GlslSource, name: string, transform: ProcessedTransformDefinition) => void;
    then(...transforms: TransformApplication[]): this;
    out(output: Output): void;
    glsl(): CompiledTransform[];
    compile(transforms: TransformApplication[]): {
        frag: string;
        uniforms: {
            [x: string]: string | import("regl").Texture2D | ((context: any, props: any) => number | number[]) | import("regl").Uniform | undefined;
        };
    };
}
