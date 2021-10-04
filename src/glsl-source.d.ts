import { Uniforms } from 'regl';
import { GeneratorFactory } from './generator-factory';
import { TransformDefinition } from './glsl/glsl-functions';
import { Output } from './output';
import { Precision } from '../hydra-synth';
export interface TransformApplication {
    defaultUniforms?: GlslSource['defaultUniforms'];
    name: string;
    precision: Precision;
    synth?: GlslSource['synth'];
    transform: TransformDefinition;
    userArgs: any[];
}
export declare type CompiledTransform = ReturnType<GlslSource['compile']>;
export declare class GlslSource {
    defaultUniforms?: Uniforms;
    precision: Precision;
    synth?: GeneratorFactory;
    transforms: TransformApplication[];
    constructor(obj: TransformApplication);
    then(...transforms: TransformApplication[]): this;
    out(output: Output): void;
    glsl(): CompiledTransform[];
    compile(transforms: TransformApplication[]): {
        frag: string;
        uniforms: {
            [x: string]: string | import("regl").Uniform | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | undefined;
        };
    };
}
