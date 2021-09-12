import { Texture2D } from 'regl';
import HydraSource from '../hydra-source';
export declare type TransformDefinitionType = 'src' | 'color' | 'combine' | 'coord' | 'combineCoord' | 'renderpass';
declare type TransformDefinitionInputType = 'float' | 'sampler2D' | 'vec4' | 'texture';
export interface TransformDefinitionInput {
    type: TransformDefinitionInputType;
    name: string;
    default?: (number | number[]) | ((context: any, props: any) => number | number[]) | string | Texture2D | HydraSource;
}
export interface TransformDefinition {
    name: string;
    type: TransformDefinitionType;
    inputs: TransformDefinitionInput[];
    glsl: string;
}
declare const transforms: TransformDefinition[];
export default transforms;
