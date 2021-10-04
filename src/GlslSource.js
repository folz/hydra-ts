import { utilityFunctions } from './glsl/utilityFunctions';
import { compileGlsl } from './compileGlsl';
export class GlslSource {
    constructor(obj) {
        this.transforms = [];
        this.defaultUniforms = obj.defaultUniforms;
        this.precision = obj.precision;
        this.transforms.push(obj);
    }
    then(...transforms) {
        this.transforms.push(...transforms);
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
            return [this.compile(this.transforms)];
        }
        return [];
    }
    compile(transforms) {
        const shaderInfo = compileGlsl(transforms);
        const uniforms = {};
        shaderInfo.uniforms.forEach((uniform) => {
            uniforms[uniform.name] = uniform.value;
        });
        const frag = `
  precision ${this.precision} float;
  ${Object.values(shaderInfo.uniforms)
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

  ${shaderInfo.glslFunctions
            .map((transform) => {
            return `
            ${transform.transform.glsl}
          `;
        })
            .join('')}

  void main () {
    vec4 c = vec4(1, 0, 0, 1);
    vec2 st = gl_FragCoord.xy/resolution.xy;
    gl_FragColor = ${shaderInfo.fragColor};
  }
  `;
        return {
            frag: frag,
            uniforms: Object.assign(Object.assign({}, this.defaultUniforms), uniforms),
        };
    }
}
