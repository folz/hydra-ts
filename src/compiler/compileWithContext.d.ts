import { Precision } from '../Hydra';
import { TypedArg } from './formatArguments';
import { TransformApplication } from '../glsl/Glsl';
import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
export interface TransformApplicationContext {
    defaultUniforms?: {
        [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    precision: Precision;
}
export declare type CompiledTransform = {
    frag: string;
    uniforms: {
        [name: string]: string | Uniform | ((context: any, props: any) => number | number[]) | Texture2D | undefined;
    };
};
export interface ShaderParams {
    uniforms: TypedArg[];
    transformApplications: TransformApplication[];
    fragColor: string;
}
export declare function compileWithContext(transformApplications: TransformApplication[], context: TransformApplicationContext): CompiledTransform;
export declare function compileGlsl(transformApplications: TransformApplication[]): ShaderParams;
