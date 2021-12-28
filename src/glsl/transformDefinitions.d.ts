import { Texture2D } from 'regl';
export declare type TransformDefinitionType = 'src' | 'coord' | 'color' | 'combine' | 'combineCoord';
export declare type TransformDefinitionInputTypeFloat = {
    type: 'float';
    default?: number | number[] | ((context: any, props: any) => number | number[]);
};
export declare type TransformDefinitionInputTypeSampler2D = {
    type: 'sampler2D';
    default?: Texture2D | number;
};
export declare type TransformDefinitionInputTypeVec4 = {
    type: 'vec4';
    default?: string | number;
};
export declare type TransformDefinitionInputTypeTexture = {
    type: 'texture';
    default?: Texture2D;
};
export declare type TransformDefinitionInputUnion = TransformDefinitionInputTypeFloat | TransformDefinitionInputTypeSampler2D | TransformDefinitionInputTypeVec4 | TransformDefinitionInputTypeTexture;
export declare type TransformDefinitionInput = TransformDefinitionInputUnion & {
    name: string;
    vecLen?: number;
};
export interface TransformDefinition {
    name: string;
    type: TransformDefinitionType;
    inputs: readonly TransformDefinitionInput[];
    glsl: string;
}
export interface ProcessedTransformDefinition extends TransformDefinition {
    processed: true;
}
export declare const transforms: TransformDefinition[];
