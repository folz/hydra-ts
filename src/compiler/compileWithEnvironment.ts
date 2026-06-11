import { GlEnvironment } from '../Hydra';
import { TypedArg } from './formatArguments';
import { utilityFunctions } from '../glsl/utilityFunctions';
import { TransformApplication } from '../glsl/Glsl';
import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
import { generateGlsl } from './generateGlsl';

export type CompiledTransform = {
  frag: string;
  uniforms: {
    [name: string]:
      | string
      | Uniform
      | ((context: any, props: any) => number | number[])
      | Texture2D
      | DynamicVariable<any>
      | DynamicVariableFn<any, any, any>
      | undefined;
  };
};

export interface ShaderParams {
  uniforms: TypedArg[];
  transformApplications: TransformApplication[];
  fragColor: string;
}

// The fragment shader emitted here is kept byte-identical to the one
// hydra-synth's GlslSource.compile() produces (given the same precision), so
// outputs can be compared 1:1 against upstream. See test/equivalence.
export function compileWithEnvironment(
  transformApplications: TransformApplication[],
  environment: GlEnvironment,
): CompiledTransform {
  const shaderParams = compileGlsl(transformApplications);

  const uniforms: CompiledTransform['uniforms'] = {};
  shaderParams.uniforms.forEach((uniform) => {
    uniforms[uniform.name] =
      uniform.value as CompiledTransform['uniforms'][string];
  });

  const frag = `
  precision ${environment.precision} float;
  ${Object.values(shaderParams.uniforms)
    .map((uniform) => {
      return `
      uniform ${uniform.type} ${uniform.name};`;
    })
    .join('')}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  uniform sampler2D prevBuffer;

  ${Object.values(utilityFunctions)
    .map((transform) => {
      return `
            ${transform.glsl}
          `;
    })
    .join('')}

  ${shaderParams.transformApplications
    .map((transformApplication) => {
      return `
            ${transformApplication.transform.glsl}
          `;
    })
    .join('')}

  void main () {
    vec2 st = gl_FragCoord.xy/resolution.xy;

    ${shaderParams.fragColor}
    gl_FragColor = c;
  }
  `;

  return {
    frag: frag,
    uniforms: { ...environment.defaultUniforms, ...uniforms },
  };
}

export function compileGlsl(
  transformApplications: TransformApplication[],
): ShaderParams {
  const shaderParams: ShaderParams = {
    uniforms: [],
    transformApplications: [],
    fragColor: '',
  };

  // Note: generateGlsl() also mutates shaderParams.uniforms and
  // shaderParams.transformApplications as it walks the transform tree.
  shaderParams.fragColor = generateGlsl(transformApplications, shaderParams)(
    'c',
    'st',
  );

  // remove uniforms with duplicate names
  const uniforms: Record<string, TypedArg> = {};
  shaderParams.uniforms.forEach(
    (uniform) => (uniforms[uniform.name] = uniform),
  );
  shaderParams.uniforms = Object.values(uniforms);

  return shaderParams;
}
