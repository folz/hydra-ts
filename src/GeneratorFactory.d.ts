import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
import { Precision } from '../HydraRenderer';
interface GeneratorFactoryOptions {
    changeListener?: GeneratorFactory['changeListener'];
    defaultUniforms?: GeneratorFactory['defaultUniforms'];
    precision: Precision;
    transforms: TransformDefinition[];
}
export declare class GeneratorFactory {
    changeListener: (options: any) => void;
    defaultUniforms: Uniforms;
    generators: Record<string, () => GlslSource>;
    glslTransforms: Record<string, ProcessedTransformDefinition>;
    precision: Precision;
    sourceClass: typeof GlslSource;
    constructor({ changeListener, defaultUniforms, precision, transforms, }: GeneratorFactoryOptions);
    _addMethod(method: string, transform: ProcessedTransformDefinition): void;
    setFunction: (obj: TransformDefinition) => void;
}
export declare function processGlsl(obj: TransformDefinition): ProcessedTransformDefinition;
export {};
