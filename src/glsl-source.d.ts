import { Uniforms } from 'regl';
import { GeneratorFactory } from './generator-factory';
import { TransformDefinition } from './glsl/glsl-functions';
import { Output } from './output';
export interface TransformApplication {
    defaultOutput: GlslSource['defaultOutput'];
    defaultUniforms?: GlslSource['defaultUniforms'];
    name: string;
    synth?: GlslSource['synth'];
    transform: TransformDefinition;
    userArgs: any[];
}
export declare type CompiledTransform = ReturnType<GlslSource['compile']>;
export declare class GlslSource {
    defaultOutput: Output;
    defaultUniforms?: Uniforms;
    synth?: GeneratorFactory;
    transforms: TransformApplication[];
    type: "GlslSource";
    constructor(obj: TransformApplication);
    then(...transforms: TransformApplication[]): void;
    out(output?: Output): void;
    glsl(): CompiledTransform[];
    compile(transforms: TransformApplication[]): {
        frag: string;
        uniforms: {
            [x: string]: string | import("regl").Uniform | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | undefined;
        };
    };
}
