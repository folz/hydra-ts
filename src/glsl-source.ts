import { compileGlsl, TypedArg } from './glsl-utils';
import utilityGlsl from './glsl/utility-functions';
import { GeneratorFactory } from './generator-factory';
import { Output } from './output';
import { Uniforms } from 'regl';
import { TransformDefinition } from './glsl/glsl-functions';

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

  addTransform(obj: TransformApplication) {
    this.transforms.push(obj);
  }

  out(_output: Output) {
    var output = _output || this.defaultOutput;
    var glsl = this.glsl(output);
    // output.renderPasses(glsl)
    if (output)
      try {
        output.render(glsl);
      } catch (error) {
        console.log('shader could not compile', error);
      }
  }

  glsl(output?: Output): CompiledTransform[] {
    //var output = _output || this.defaultOutput
    // uniforms included in all shaders
    //  this.defaultUniforms = output.uniforms
    var passes: CompiledTransform[] = [];
    var transforms: TransformApplication[] = [];
    //  console.log('output', output)
    this.transforms.forEach((transform) => {
      if (transform.transform.type === 'renderpass') {
        // if (transforms.length > 0) passes.push(this.compile(transforms, output))
        // transforms = []
        // var uniforms = {}
        // const inputs = formatArguments(transform, -1)
        // inputs.forEach((uniform) => { uniforms[uniform.name] = uniform.value })
        //
        // passes.push({
        //   frag: transform.transform.frag,
        //   uniforms: Object.assign({}, self.defaultUniforms, uniforms)
        // })
        // transforms.push({name: 'prev', transform:  transforms['prev'], synth: this.synth})
        console.warn('no support for renderpass');
      } else {
        transforms.push(transform);
      }
    });

    if (transforms.length > 0) {
      passes.push(this.compile(transforms));
    }

    return passes;
  }

  compile(transforms: TransformApplication[]) {
    var shaderInfo = compileGlsl(transforms);
    var uniforms: Record<TypedArg['name'], TypedArg['value']> = {};
    shaderInfo.uniforms.forEach((uniform) => {
      uniforms[uniform.name] = uniform.value;
    });

    var frag = `
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

  ${Object.values(utilityGlsl)
    .map((transform) => {
      //  console.log(transform.glsl)
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
