import { TransformApplication } from '../GlslSource';
import { ShaderParams } from '../compileGlsl';
import { TypedArg } from './formatArguments';
export declare function shaderString(uv: string, method: TransformApplication['name'], inputs: TypedArg[], shaderParams: ShaderParams): string;
