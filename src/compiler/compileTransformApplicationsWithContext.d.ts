import { Precision } from '../HydraRenderer';
import { CompiledTransform, GlslSource, TransformApplication } from '../GlslSource';
interface TransformApplicationContext {
    defaultUniforms: GlslSource['defaultUniforms'];
    precision: Precision;
}
export declare function compileTransformApplicationsWithContext(transformApplications: TransformApplication[], context: TransformApplicationContext): CompiledTransform;
export {};
