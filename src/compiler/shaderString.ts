import { ShaderParams } from '../compileGlsl';
import { generateGlsl } from './generateGlsl';
import { TypedArg } from './formatArguments';
import { TransformDefinition } from '../glsl/transformDefinitions';

export function shaderString(
  uv: string,
  method: TransformDefinition['name'],
  inputs: TypedArg[],
  shaderParams: ShaderParams,
): string {
  const str = inputs
    .map((input) => {
      if (input.isUniform) {
        return input.name;
      } else if (input.value && input.value.transforms) {
        // this by definition needs to be a generator, hence we start with 'st' as the initial value for generating the glsl fragment
        return `${generateGlsl(input.value.transforms, shaderParams)('st')}`;
      }
      return input.value;
    })
    .reduce((p, c) => `${p}, ${c}`, '');

  return `${method}(${uv}${str})`;
}
