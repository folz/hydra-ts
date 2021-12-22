import { ShaderParams } from './compileGlsl';
import { TypedArg } from './formatArguments';
import { TransformDefinition } from '../glsl/transformDefinitions';
export declare function shaderString(uv: string, method: TransformDefinition['name'], inputs: TypedArg[], shaderParams: ShaderParams): string;
