import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
import { Glsl } from './Glsl';
declare type GeneratorMap = Record<string, () => Glsl>;
export declare function createGenerators({ transformDefinitions, }: {
    transformDefinitions: TransformDefinition[];
}): GeneratorMap;
export declare function createTransformOnPrototype(cls: typeof Glsl, processedTransformDefinition: ProcessedTransformDefinition): void;
export declare function processGlsl(transformDefinition: TransformDefinition): ProcessedTransformDefinition;
export {};
