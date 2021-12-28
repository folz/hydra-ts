import { Precision } from '../HydraRenderer';
import { compileGlsl } from './compileGlsl';
import { TypedArg } from './formatArguments';
import { utilityFunctions } from '../glsl/utilityFunctions';
import {
  CompiledTransform,
  Glsl,
  TransformApplication,
} from '../Glsl';

interface TransformApplicationContext {
  defaultUniforms: Glsl['defaultUniforms'];
  precision: Precision;
}

export function compileTransformApplicationsWithContext(
  transformApplications: TransformApplication[],
  context: TransformApplicationContext,
): CompiledTransform {
  const shaderParams = compileGlsl(transformApplications);

  const uniforms: Record<TypedArg['name'], TypedArg['value']> = {};
  shaderParams.uniforms.forEach((uniform) => {
    uniforms[uniform.name] = uniform.value;
  });

  const frag = `
  precision ${context.precision} float;
  ${Object.values(shaderParams.uniforms)
    .map((uniform) => {
      let type = uniform.type;
      switch (uniform.type) {
        case 'texture':
          type = 'sampler2D';
          break;
      }
      return `
      uniform ${type} ${uniform.name};`;
    })
    .join('')}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;

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
    vec4 c = vec4(1, 0, 0, 1);
    vec2 st = gl_FragCoord.xy/resolution.xy;
    gl_FragColor = ${shaderParams.fragColor};
  }
  `;

  return {
    frag: frag,
    uniforms: { ...context.defaultUniforms, ...uniforms },
  };
}
