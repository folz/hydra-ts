import { TransformDefinition } from './glsl/glsl-functions.js';
import { GlslSource } from './glsl-source';
import { Output } from './output';
import { Uniforms } from 'regl';
interface GeneratorFactoryOptions {
    defaultUniforms?: GeneratorFactory['defaultUniforms'];
    defaultOutput: GeneratorFactory['defaultOutput'];
    extendTransforms?: GeneratorFactory['extendTransforms'];
    changeListener?: GeneratorFactory['changeListener'];
}
export declare class GeneratorFactory {
    defaultUniforms: Uniforms;
    defaultOutput: Output;
    extendTransforms: TransformDefinition | TransformDefinition[];
    changeListener: (options: any) => void;
    generators: Record<string, () => GlslSource>;
    glslTransforms: Record<string, TransformDefinition>;
    sourceClass: typeof GlslSource;
    type: "GeneratorFactory";
    constructor({ defaultUniforms, defaultOutput, extendTransforms, changeListener, }: GeneratorFactoryOptions);
    _addMethod(method: string, transform: TransformDefinition): ((...args: any[]) => GlslSource) | undefined;
    setFunction(obj: TransformDefinition): void;
}
export {};
