import { TransformApplication } from './GlslSource';
import { generateGlsl } from './compiler/generateGlsl';
import { TypedArg } from './compiler/formatArguments';

export interface ShaderParams {
  uniforms: TypedArg[];
  glslFunctions: TransformApplication[];
  fragColor: string;
}

export function compileGlsl(transforms: TransformApplication[]) {
  const shaderParams: ShaderParams = {
    uniforms: [],
    glslFunctions: [],
    fragColor: '',
  };

  const gen = generateGlsl(transforms, shaderParams)('st');
  shaderParams.fragColor = gen;
  // remove uniforms with duplicate names
  let uniforms: Record<string, TypedArg> = {};
  shaderParams.uniforms.forEach(
    (uniform) => (uniforms[uniform.name] = uniform),
  );
  shaderParams.uniforms = Object.values(uniforms);
  return shaderParams;
}
