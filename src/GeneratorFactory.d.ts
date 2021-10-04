import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import type { Output } from './Output';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
interface GeneratorFactoryOptions {
    changeListener?: GeneratorFactory['changeListener'];
    defaultOutput: GeneratorFactory['defaultOutput'];
    defaultUniforms?: GeneratorFactory['defaultUniforms'];
    transforms: TransformDefinition[];
}
export declare class GeneratorFactory {
    changeListener: (options: any) => void;
    defaultOutput: Output;
    defaultUniforms: Uniforms;
    generators: Record<string, () => GlslSource>;
    glslTransforms: Record<string, ProcessedTransformDefinition>;
    sourceClass: typeof GlslSource;
    constructor({ defaultUniforms, defaultOutput, changeListener, transforms, }: GeneratorFactoryOptions);
    _addMethod(method: string, transform: ProcessedTransformDefinition): void;
    setFunction: (obj: TransformDefinition) => void;
}
export declare function processGlsl(obj: TransformDefinition): ProcessedTransformDefinition;
export {};
