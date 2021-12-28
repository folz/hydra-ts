import { Precision } from '../HydraRenderer';
import { CompiledTransform, Glsl, TransformApplication } from '../Glsl';
interface TransformApplicationContext {
    defaultUniforms: Glsl['defaultUniforms'];
    precision: Precision;
}
export declare function compileTransformApplicationsWithContext(transformApplications: TransformApplication[], context: TransformApplicationContext): CompiledTransform;
export {};
