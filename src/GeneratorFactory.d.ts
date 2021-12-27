import { DynamicVariable, DynamicVariableFn } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions.js';
import { Precision } from './HydraRenderer';
export declare function GeneratorFactory({ changeListener, defaultUniforms, precision, transformDefinitions, }: {
    changeListener: (options: {
        generator: () => GlslSource;
        name: string;
    }) => void;
    defaultUniforms: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    precision: Precision;
    transformDefinitions: TransformDefinition[];
}): void;
export declare function createTransformOnPrototype(cls: typeof GlslSource, processedTransformDefinition: ProcessedTransformDefinition): void;
export declare function processGlsl(transformDefinition: TransformDefinition): ProcessedTransformDefinition;
