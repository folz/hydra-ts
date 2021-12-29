import { ProcessedTransformDefinition, TransformDefinition } from './transformDefinitions.js';
import { Glsl } from './Glsl';
declare type GeneratorMap = Record<string, () => Glsl>;
export declare function createGenerators({ generatorTransforms, modifierTransforms, }: {
    generatorTransforms: readonly TransformDefinition[];
    modifierTransforms: readonly TransformDefinition[];
}): GeneratorMap;
export declare function createTransformOnPrototype(cls: typeof Glsl, processedTransformDefinition: ProcessedTransformDefinition): void;
export declare function processGlsl(transformDefinition: TransformDefinition): ProcessedTransformDefinition;
export {};
