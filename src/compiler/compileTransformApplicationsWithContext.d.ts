import { Precision } from '../HydraRenderer';
import { TransformApplication } from '../Glsl';
import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
interface TransformApplicationContext {
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
export declare function compileTransformApplicationsWithContext(transformApplications: TransformApplication[], context: TransformApplicationContext): CompiledTransform;
export {};
