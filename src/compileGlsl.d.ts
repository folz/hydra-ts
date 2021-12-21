import { TransformApplication } from './GlslSource';
import { TypedArg } from './compiler/formatArguments';
export interface ShaderParams {
    uniforms: TypedArg[];
    glslFunctions: TransformApplication[];
    fragColor: string;
}
export declare function compileGlsl(transformApplications: TransformApplication[]): ShaderParams;
