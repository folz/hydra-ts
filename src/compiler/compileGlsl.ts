import { TransformApplication } from '../Glsl';
import { generateGlsl } from './generateGlsl';
import { TypedArg } from './formatArguments';

export interface ShaderParams {
  uniforms: TypedArg[];
  transformApplications: TransformApplication[];
  fragColor: string;
}

export function compileGlsl(
  transformApplications: TransformApplication[],
): ShaderParams {
  const shaderParams: ShaderParams = {
    uniforms: [],
    transformApplications: [],
    fragColor: '',
  };

  // Note: generateGlsl() also mutates shaderParams.transformApplications
  shaderParams.fragColor = generateGlsl(
    transformApplications,
    shaderParams,
  )('st');

  // remove uniforms with duplicate names
  let uniforms: Record<string, TypedArg> = {};
  shaderParams.uniforms.forEach(
    (uniform) => (uniforms[uniform.name] = uniform),
  );
  shaderParams.uniforms = Object.values(uniforms);

  return shaderParams;
}
