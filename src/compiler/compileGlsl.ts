import produce from 'immer';

import { TransformApplication } from '../GlslSource';
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

  const newParams = produce(shaderParams, (draft) => {
    draft.fragColor = generateGlsl(transformApplications, draft)('st');
    // remove uniforms with duplicate names
    let uniforms: Record<string, TypedArg> = {};
    draft.uniforms.forEach((uniform) => (uniforms[uniform.name] = uniform));
    draft.uniforms = Object.values(uniforms);
  });

  console.log(shaderParams, newParams);

  return newParams;
}
