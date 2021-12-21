import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import {
  ProcessedTransformDefinition,
  typeLookup,
} from './glsl/transformDefinitions.js';
import { Precision } from '../HydraRenderer';

interface GeneratorFactoryOptions {
  changeListener: GeneratorFactory['changeListener'];
  defaultUniforms: GeneratorFactory['defaultUniforms'];
  precision: Precision;
  transforms: TransformDefinition[];
}

export class GeneratorFactory {
  changeListener: (options: any) => void;
  defaultUniforms: Uniforms;
  generators: Record<string, () => GlslSource> = {};
  glslTransforms: Record<string, ProcessedTransformDefinition> = {};
  precision: Precision;
  sourceClass = class extends GlslSource {};

  constructor({
    changeListener,
    defaultUniforms,
    precision,
    transforms,
  }: GeneratorFactoryOptions) {
    this.changeListener = changeListener;
    this.defaultUniforms = defaultUniforms;
    this.precision = precision;

    for (const transform of transforms) {
      this.setFunction(transform);
    }
  }

  setFunction = (transformDefinition: TransformDefinition) => {
    const { name } = transformDefinition;
    const processedTransformDefinition = processGlsl(transformDefinition);

    this.glslTransforms[name] = processedTransformDefinition;

    const { precision } = this;

    if (processedTransformDefinition.type === 'src') {
      this.generators[name] = (...args: any[]) =>
        new this.sourceClass({
          defaultUniforms: this.defaultUniforms,
          name,
          precision,
          transform: processedTransformDefinition,
          userArgs: args,
        });
      this.changeListener({ synth: this, method: name });
    } else {
      createTransformOnPrototype(
        this.sourceClass,
        processedTransformDefinition,
      );
    }
  };
}

export function createTransformOnPrototype(
  cls: typeof GlslSource,
  processedTransformDefinition: ProcessedTransformDefinition,
) {
  function addTransformApplicationToInternalChain(
    this: GlslSource,
    ...args: any[]
  ): GlslSource {
    this.transforms.push({
      name: processedTransformDefinition.name,
      transform: processedTransformDefinition,
      precision: this.precision,
      userArgs: args,
    });

    return this;
  }

  cls.prototype[processedTransformDefinition.name] =
    addTransformApplicationToInternalChain;
}

export function processGlsl(
  obj: TransformDefinition,
): ProcessedTransformDefinition {
  let t = typeLookup[obj.type];

  let baseArgs = t.args.map((arg) => arg).join(', ');
  // @todo: make sure this works for all input types, add validation
  let customArgs = obj.inputs
    .map((input) => `${input.type} ${input.name}`)
    .join(', ');
  let args = `${baseArgs}${customArgs.length > 0 ? ', ' + customArgs : ''}`;

  let glslFunction = `
  ${t.returnType} ${obj.name}(${args}) {
      ${obj.glsl}
  }
`;

  // add extra input to beginning for backward compatibility
  if (obj.type === 'combine' || obj.type === 'combineCoord') {
    obj.inputs.unshift({
      name: 'color',
      type: 'vec4',
    });
  }

  return {
    ...obj,
    glsl: glslFunction,
    processed: true,
  };
}
