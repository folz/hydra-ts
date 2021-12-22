import { utilityFunctions } from './glsl/utilityFunctions';
import { compileGlsl } from './compileGlsl';
export class GlslSource {
    constructor(transformApplication) {
        this.transforms = [];
        this.defaultUniforms = transformApplication.defaultUniforms;
        this.precision = transformApplication.precision;
        this.transforms.push(transformApplication);
    }
    do(...transforms) {
        this.transforms.push(...transforms);
        return this;
    }
    skip(...transforms) {
        return this;
    }
    out(output) {
        const glsl = this.glsl();
        try {
            output.render(glsl);
        }
        catch (error) {
            console.log('shader could not compile', error);
        }
    }
    glsl() {
        if (this.transforms.length > 0) {
            const context = {
                defaultUniforms: this.defaultUniforms,
                precision: this.precision,
            };
            return [
                compileTransformApplicationsAgainstContext(this.transforms, context),
            ];
        }
        return [];
    }
}
function compileTransformApplicationsAgainstContext(transformApplications, context) {
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
