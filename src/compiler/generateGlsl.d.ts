import { TransformApplication } from '../GlslSource';
import { ShaderParams } from '../compileGlsl';
export declare type GlslGenerator = (uv: string) => string;
export declare function generateGlsl(transforms: TransformApplication[], shaderParams: ShaderParams): GlslGenerator;
