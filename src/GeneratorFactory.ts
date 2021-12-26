import { DynamicVariable, DynamicVariableFn } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import {
  ProcessedTransformDefinition,
  TransformDefinitionType,
} from './glsl/transformDefinitions.js';
import { Precision } from './HydraRenderer';

interface GeneratorFactoryOptions {
  changeListener: GeneratorFactory['changeListener'];
  defaultUniforms: GeneratorFactory['defaultUniforms'];
  precision: Precision;
  transforms: TransformDefinition[];
}

export class GeneratorFactory {
  changeListener: (options: any) => void;
  defaultUniforms: {
    [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
  };
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

  setFunction = (transformDefinition: TransformDefinition): void => {
    const processedTransformDefinition = processGlsl(transformDefinition);

    const { name } = processedTransformDefinition;

    this.glslTransforms[name] = processedTransformDefinition;

    if (processedTransformDefinition.type === 'src') {
      this.generators[name] = (...args: any[]) =>
        new this.sourceClass({
          defaultUniforms: this.defaultUniforms,
          precision: this.precision,
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
      transform: processedTransformDefinition,
      precision: this.precision,
      userArgs: args,
    });

    return this;
  }

  // @ts-ignore
  cls.prototype[processedTransformDefinition.name] =
    addTransformApplicationToInternalChain;
}

const typeLookup: Record<
  TransformDefinitionType,
  { returnType: string; implicitFirstArg: string }
> = {
  src: {
    returnType: 'vec4',
    implicitFirstArg: 'vec2 _st',
  },
  coord: {
    returnType: 'vec2',
    implicitFirstArg: 'vec2 _st',
  },
  color: {
    returnType: 'vec4',
    implicitFirstArg: 'vec4 _c0',
  },
  combine: {
    returnType: 'vec4',
    implicitFirstArg: 'vec4 _c0',
  },
  combineCoord: {
    returnType: 'vec2',
    implicitFirstArg: 'vec2 _st',
  },
};

export function processGlsl(
  transformDefinition: TransformDefinition,
): ProcessedTransformDefinition {
  let { implicitFirstArg, returnType } = typeLookup[transformDefinition.type];

  let customArgs = transformDefinition.inputs
    .map((input) => `${input.type} ${input.name}`)
    .join(', ');
  let args = `${implicitFirstArg}${
    customArgs.length > 0 ? ', ' + customArgs : ''
  }`;

  let glslFunction = `
  ${returnType} ${transformDefinition.name}(${args}) {
      ${transformDefinition.glsl}
  }
`;

  return {
    ...transformDefinition,
    glsl: glslFunction,
    processed: true,
  };
}
