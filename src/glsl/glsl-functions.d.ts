import { Texture2D } from 'regl';
import { HydraSource } from '../hydra-source';
export declare type TransformDefinitionType = 'src' | 'color' | 'combine' | 'coord' | 'combineCoord' | 'renderpass';
declare type TransformDefinitionInputType = 'float' | 'sampler2D' | 'vec4' | 'texture';
export interface ITransformDefinitionInput {
    type: TransformDefinitionInputType;
    name: string;
    default?: number | number[] | ((context: any, props: any) => number | number[]) | string | Texture2D | HydraSource;
}
declare type TransformDefinitionInputTypeFloat = {
    type: 'float';
    default?: number | number[] | ((context: any, props: any) => number | number[]);
};
declare type TransformDefinitionInputTypeSampler2D = {
    type: 'sampler2D';
    default?: Texture2D | number;
};
declare type TransformDefinitionInputTypeVec4 = {
    type: 'vec4';
    default?: string | number;
};
declare type TransformDefinitionInputTypeTexture = {
    type: 'texture';
    default?: Texture2D;
};
export declare type TransformDefinitionInputUnion = TransformDefinitionInputTypeFloat | TransformDefinitionInputTypeSampler2D | TransformDefinitionInputTypeVec4 | TransformDefinitionInputTypeTexture;
export declare type TransformDefinitionInput = TransformDefinitionInputUnion & {
    name: string;
};
export interface TransformDefinition {
    name: string;
    type: TransformDefinitionType;
    inputs: TransformDefinitionInput[];
    glsl: string;
}
export declare const transforms: TransformDefinition[];
export {};
