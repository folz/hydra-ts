import { Texture2D, Uniforms, Uniform } from 'regl';
import {
  ProcessedTransformDefinition,
  TransformDefinitionInput,
} from './glsl/transformDefinitions';
import { utilityFunctions } from './glsl/utilityFunctions';
import { compileGlsl } from './compileGlsl';
import { Output } from './Output';
import { Precision } from '../HydraRenderer';
import { TypedArg } from './compiler/formatArguments';

export interface TransformApplication {
  defaultUniforms?: GlslSource['defaultUniforms'];
  precision: Precision;
  transform: ProcessedTransformDefinition;
  userArgs: (
    | TransformDefinitionInput['default']
    | ((context: any, props: any) => TransformDefinitionInput['default'])
  )[];
}

export type CompiledTransform = {
  frag: string;
  uniforms: {
    [name: string]:
      | string
      | Uniform
      | ((context: any, props: any) => number | number[])
      | Texture2D
      | undefined;
  };
};

export class GlslSource {
  defaultUniforms?: Uniforms;
  precision: Precision;
  transforms: TransformApplication[] = [];

  constructor(transformApplication: TransformApplication) {
    this.defaultUniforms = transformApplication.defaultUniforms;
    this.precision = transformApplication.precision;
    this.transforms.push(transformApplication);
  }

  do(...transforms: TransformApplication[]) {
    this.transforms.push(...transforms);
    return this;
  }

  skip(...transforms: TransformApplication[]) {
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

interface TransformApplicationContext {
  defaultUniforms: GlslSource['defaultUniforms'];
  precision: Precision;
}

function compileTransformApplicationsAgainstContext(
  transformApplications: TransformApplication[],
  context: TransformApplicationContext,
) {
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
    uniforms: { ...context.defaultUniforms, ...uniforms },
  };
}
