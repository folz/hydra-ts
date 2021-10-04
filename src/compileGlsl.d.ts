import { TransformApplication } from './GlslSource';
import { TransformDefinitionInput } from './glsl/transformDefinitions';
interface ShaderParams {
    uniforms: TypedArg[];
    glslFunctions: TransformApplication[];
    fragColor: string;
}
export declare function compileGlsl(transforms: TransformApplication[]): ShaderParams;
export interface TypedArg {
    value: TransformDefinitionInput['default'];
    type: TransformDefinitionInput['type'];
    isUniform: boolean;
    name: TransformDefinitionInput['name'];
    vecLen: number;
}
export {};
