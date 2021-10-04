import { Uniforms } from 'regl';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { utilityFunctions } from './glsl/utilityFunctions';
import { compileGlsl, TypedArg } from './compileGlsl';
import { Output } from './Output';
import { Precision } from '../HydraRenderer';

export interface TransformApplication {
  defaultUniforms?: GlslSource['defaultUniforms'];
  name: string;
  precision: Precision;
  transform: ProcessedTransformDefinition;
  userArgs: any[];
}

export type CompiledTransform = ReturnType<GlslSource['compile']>;

export class GlslSource {
  defaultUniforms?: Uniforms;
  precision: Precision;
  transforms: TransformApplication[] = [];

  constructor(obj: TransformApplication) {
    this.defaultUniforms = obj.defaultUniforms;
    this.precision = obj.precision;
    this.transforms.push(obj);
  }

  then(...transforms: TransformApplication[]) {
    this.transforms.push(...transforms);
    return this;
  }

  out(output: Output) {
    const glsl = this.glsl();

    try {
      output.render(glsl);
    } catch (error) {
      console.log('shader could not compile', error);
    }
  }

  glsl(): CompiledTransform[] {
    if (this.transforms.length > 0) {
      return [this.compile(this.transforms)];
    }

    return [];
  }

  compile(transforms: TransformApplication[]) {
    const shaderInfo = compileGlsl(transforms);
    const uniforms: Record<TypedArg['name'], TypedArg['value']> = {};
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
      uniforms: { ...this.defaultUniforms, ...uniforms },
    };
  }
}
