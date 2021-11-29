import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
import { Precision } from '../HydraRenderer';
interface GeneratorFactoryOptions {
    changeListener: GeneratorFactory['changeListener'];
    defaultUniforms: GeneratorFactory['defaultUniforms'];
    precision: Precision;
    transforms: TransformDefinition[];
}
export declare class GeneratorFactory {
    changeListener: (options: any) => void;
    defaultUniforms: Uniforms;
    generators: Record<string, () => GlslSource>;
    glslTransforms: Record<string, ProcessedTransformDefinition>;
    precision: Precision;
    sourceClass: {
        new (obj: import("./GlslSource").TransformApplication): {
            defaultUniforms?: Uniforms | undefined;
            precision: Precision;
            transforms: import("./GlslSource").TransformApplication[];
            do(...transforms: import("./GlslSource").TransformApplication[]): any;
            skip(...transforms: import("./GlslSource").TransformApplication[]): any;
            out(output: import("./Output.js").Output): void;
            glsl(): {
                frag: string;
                uniforms: {
                    [x: string]: string | import("regl").Texture2D | ((context: any, props: any) => number | number[]) | import("regl").Uniform | undefined;
                };
            }[];
            compile(transforms: import("./GlslSource").TransformApplication[]): {
                frag: string;
                uniforms: {
                    [x: string]: string | import("regl").Texture2D | ((context: any, props: any) => number | number[]) | import("regl").Uniform | undefined;
                };
            };
        };
        createTransformOnPrototype: (cls: typeof GlslSource, name: string, transform: ProcessedTransformDefinition) => void;
    };
    constructor({ changeListener, defaultUniforms, precision, transforms, }: GeneratorFactoryOptions);
    _addMethod(method: string, transform: ProcessedTransformDefinition): void;
    setFunction: (obj: TransformDefinition) => void;
}
export declare function processGlsl(obj: TransformDefinition): ProcessedTransformDefinition;
export {};
