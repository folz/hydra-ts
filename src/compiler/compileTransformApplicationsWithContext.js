import { compileGlsl } from './compileGlsl';
import { utilityFunctions } from '../glsl/utilityFunctions';
export function compileTransformApplicationsWithContext(transformApplications, context) {
    const shaderParams = compileGlsl(transformApplications);
    const uniforms = {};
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
    vec4 c = vec4(1, 0, 0, 1);
    vec2 st = gl_FragCoord.xy/resolution.xy;
    gl_FragColor = ${shaderParams.fragColor};
  }
  `;
    return {
        frag: frag,
        uniforms: Object.assign(Object.assign({}, context.defaultUniforms), uniforms),
    };
}
