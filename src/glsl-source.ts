import { Uniforms } from 'regl';
import { GeneratorFactory } from './generator-factory';
import { TransformDefinition } from './glsl/glsl-functions';
import { utilityFunctions } from './glsl/utility-functions';
import { compileGlsl, TypedArg } from './glsl-utils';
import { Output } from './output';

export interface TransformApplication {
  defaultOutput: GlslSource['defaultOutput'];
  defaultUniforms?: GlslSource['defaultUniforms'];
  name: string;
  synth?: GlslSource['synth'];
  transform: TransformDefinition;
  userArgs: any[];
}

export type CompiledTransform = ReturnType<GlslSource['compile']>;

export class GlslSource {
  defaultOutput: Output;
  defaultUniforms?: Uniforms;
  synth?: GeneratorFactory;
  transforms: TransformApplication[] = [];
  type = 'GlslSource' as const;

  constructor(obj: TransformApplication) {
    this.transforms.push(obj);
    this.defaultOutput = obj.defaultOutput;
    this.synth = obj.synth;
    this.defaultUniforms = obj.defaultUniforms;
  }

  then(...transforms: TransformApplication[]) {
    this.transforms.push(...transforms);
  }

  out(output: Output = this.defaultOutput) {
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
  precision ${this.defaultOutput.precision} float;
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
