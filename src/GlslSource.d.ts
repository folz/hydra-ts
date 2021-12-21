import { Uniforms } from 'regl';
import { ProcessedTransformDefinition, TransformDefinitionInput } from './glsl/transformDefinitions';
import { Output } from './Output';
import { Precision } from '../HydraRenderer';
export interface TransformApplication {
    defaultUniforms?: GlslSource['defaultUniforms'];
    precision: Precision;
    transform: ProcessedTransformDefinition;
    userArgs: (TransformDefinitionInput['default'] | ((context: any, props: any) => TransformDefinitionInput['default']))[];
}
export declare type CompiledTransform = ReturnType<GlslSource['compile']>;
export declare class GlslSource {
    defaultUniforms?: Uniforms;
    precision: Precision;
    transforms: TransformApplication[];
    constructor(obj: TransformApplication);
    do(...transforms: TransformApplication[]): this;
    skip(...transforms: TransformApplication[]): this;
    out(output: Output): void;
    glsl(): CompiledTransform[];
    compile(transformApplications: TransformApplication[]): {
        frag: string;
        uniforms: {
            [x: string]: string | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | import("regl").Uniform | undefined;
        };
    };
}
