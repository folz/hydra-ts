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
                    [x: string]: string | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | import("regl").Uniform | undefined;
                };
            }[];
            compile(transformApplications: import("./GlslSource").TransformApplication[]): {
                frag: string;
                uniforms: {
                    [x: string]: string | ((context: any, props: any) => number | number[]) | import("regl").Texture2D | import("regl").Uniform | undefined;
                };
            };
        };
    };
    constructor({ changeListener, defaultUniforms, precision, transforms, }: GeneratorFactoryOptions);
    setFunction: (transformDefinition: TransformDefinition) => void;
}
export declare function createTransformOnPrototype(cls: typeof GlslSource, processedTransformDefinition: ProcessedTransformDefinition): void;
export declare function processGlsl(transformDefinition: TransformDefinition): ProcessedTransformDefinition;
export {};
