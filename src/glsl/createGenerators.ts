import {
  ProcessedTransformDefinition,
  TransformDefinition,
  TransformDefinitionType,
} from './transformDefinitions.js';
import { Glsl } from './Glsl';
import ImmutableList from './ImmutableList.js';

type GeneratorMap = Record<string, (...args: unknown[]) => Glsl>;

export function createGenerators({
  generatorTransforms,
  modifierTransforms,
}: {
  generatorTransforms: readonly TransformDefinition[];
  modifierTransforms: readonly TransformDefinition[];
}): GeneratorMap {
  const sourceClass = class extends Glsl {};
  const generatorMap: GeneratorMap = {};

  for (const transform of generatorTransforms) {
    const processed = processGlsl(transform);

    generatorMap[processed.name] = (...args: unknown[]) =>
      new sourceClass(new ImmutableList({
        transform: processed,
        userArgs: args,
      }));
  }

  for (const transform of modifierTransforms) {
    const processed = processGlsl(transform);

    createTransformOnPrototype(sourceClass, processed);
  }

  return generatorMap;
}

export function createTransformOnPrototype(
  cls: typeof Glsl,
  processedTransformDefinition: ProcessedTransformDefinition,
) {
  function addTransformApplicationToInternalChain(
    this: Glsl,
    ...args: unknown[]
  ): Glsl {
    const transform = {
      transform: processedTransformDefinition,
      userArgs: args,
    };

    return new cls(this.transforms.append(transform));
  }

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
  const { implicitFirstArg, returnType } = typeLookup[transformDefinition.type];

  const signature = [
    implicitFirstArg,
    ...transformDefinition.inputs.map((input) => `${input.type} ${input.name}`),
  ].join(', ');

  const glslFunction = `
  ${returnType} ${transformDefinition.name}(${signature}) {
      ${transformDefinition.glsl}
  }
`;

  return {
    ...transformDefinition,
    glsl: glslFunction,
    processed: true,
  };
}
