import { DynamicVariable, DynamicVariableFn } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import {
  ProcessedTransformDefinition,
  TransformDefinitionType,
} from './glsl/transformDefinitions.js';
import { Precision } from './HydraRenderer';

type GeneratorMap = Record<string, () => GlslSource>;

export function GeneratorFactory({
  defaultUniforms,
  precision,
  transformDefinitions,
}: {
  defaultUniforms: {
    [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
  };
  precision: Precision;
  transformDefinitions: TransformDefinition[];
}): GeneratorMap {
  const sourceClass = class extends GlslSource {};
  const ret: GeneratorMap = {};

  for (const transformDefinition of transformDefinitions) {
    const processedTransformDefinition = processGlsl(transformDefinition);

    const { name } = processedTransformDefinition;

    if (processedTransformDefinition.type === 'src') {
      ret[name] = (...args: any[]) =>
        new sourceClass({
          defaultUniforms,
          precision,
          transform: processedTransformDefinition,
          userArgs: args,
        });
    } else {
      createTransformOnPrototype(sourceClass, processedTransformDefinition);
    }
  }

  return ret;
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
