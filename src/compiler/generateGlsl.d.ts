import { TransformApplication } from '../Glsl';
import { ShaderParams } from './compileGlsl';
export declare type GlslGenerator = (uv: string) => string;
export declare function generateGlsl(transformApplications: TransformApplication[], shaderParams: ShaderParams): GlslGenerator;
