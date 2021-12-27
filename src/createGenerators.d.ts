import { DynamicVariable, DynamicVariableFn } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
import { Precision } from './HydraRenderer';
declare type GeneratorMap = Record<string, () => GlslSource>;
export declare function createGenerators({ defaultUniforms, precision, transformDefinitions, }: {
    defaultUniforms: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    precision: Precision;
    transformDefinitions: TransformDefinition[];
}): GeneratorMap;
export declare function createTransformOnPrototype(cls: typeof GlslSource, processedTransformDefinition: ProcessedTransformDefinition): void;
export declare function processGlsl(transformDefinition: TransformDefinition): ProcessedTransformDefinition;
export {};
