import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { Output } from './Output';
import { Precision } from './HydraRenderer';
export interface TransformApplication {
    defaultUniforms?: Glsl['defaultUniforms'];
    precision: Precision;
    transform: ProcessedTransformDefinition;
    userArgs: unknown[];
}
export declare type CompiledTransform = {
    frag: string;
    uniforms: {
        [name: string]: string | Uniform | ((context: any, props: any) => number | number[]) | Texture2D | undefined;
    };
};
export declare class Glsl {
    defaultUniforms?: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    precision: Precision;
    transforms: TransformApplication[];
    constructor(transformApplication: TransformApplication);
    do(...transforms: TransformApplication[]): this;
    skip(...transforms: TransformApplication[]): this;
    out(output: Output): void;
    glsl(): CompiledTransform[];
}
