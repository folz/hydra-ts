import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/glsl-functions.js';
import { GlslSource } from './glsl-source';
import type { Output } from './output';
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
    glslTransforms: Record<string, TransformDefinition>;
    sourceClass: typeof GlslSource;
    constructor({ defaultUniforms, defaultOutput, changeListener, transforms, }: GeneratorFactoryOptions);
    _addMethod(method: string, transform: TransformDefinition): void;
    setFunction: (obj: TransformDefinition) => void;
}
export declare function processGlsl(obj: TransformDefinition): TransformDefinition;
export {};
