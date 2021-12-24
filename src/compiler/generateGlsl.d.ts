import { TransformApplication } from '../GlslSource';
import { ShaderParams } from './compileGlsl';
export declare type GlslGenerator = (uv: string) => string;
export declare function generateGlsl(transformApplications: TransformApplication[], shaderParams: ShaderParams): GlslGenerator;
export declare function contains(transformApplication: TransformApplication, transformApplications: TransformApplication[]): boolean;
