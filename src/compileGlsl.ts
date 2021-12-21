import produce from 'immer';

import { TransformApplication } from './GlslSource';
import { generateGlsl } from './compiler/generateGlsl';
import { TypedArg } from './compiler/formatArguments';

export interface ShaderParams {
  uniforms: TypedArg[];
  glslFunctions: TransformApplication[];
  fragColor: string;
}

export function compileGlsl(transforms: TransformApplication[]): ShaderParams {
  const shaderParams: ShaderParams = {
    uniforms: [],
    glslFunctions: [],
    fragColor: '',
  };

  const newParams = produce(shaderParams, (draft) => {
    draft.fragColor = generateGlsl(transforms, draft)('st');
    // remove uniforms with duplicate names
    let uniforms: Record<string, TypedArg> = {};
    draft.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
    draft.uniforms = Object.values(uniforms);
  });

  console.log(shaderParams, newParams);

  return newParams;
}
