import { ShaderParams } from './compileGlsl';
import { TypedArg } from './formatArguments';
import { TransformApplication } from '../GlslSource';
export declare function shaderString(uv: string, transformApplication: TransformApplication, inputs: TypedArg[], shaderParams: ShaderParams): string;
