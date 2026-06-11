import {
  ProcessedTransformDefinition,
  TransformDefinition,
  TransformDefinitionInput,
  TransformDefinitionType,
} from './transformDefinitions.js';
import { Glsl } from './Glsl';
import ImmutableList from './ImmutableList.js';

type Generator = (...args: unknown[]) => Glsl;

export function createTransformChainClass<
  T extends readonly TransformDefinition[],
>(modifierTransforms: T): typeof Glsl {
  const sourceClass = class extends Glsl {};

  for (const transform of modifierTransforms) {
    const processed = processGlsl(transform);

    addTransformChainMethod(sourceClass, processed);
  }

  return sourceClass;
}

export function createGenerator(
  generatorTransform: TransformDefinition,
  TransformChainClass: typeof Glsl,
): Generator {
  const processed = processGlsl(generatorTransform);

  return (...args: unknown[]) =>
    new TransformChainClass(
      new ImmutableList({
        transform: processed,
        userArgs: args,
      }),
    );
}

export function createGenerators(
  generatorTransforms: readonly TransformDefinition[],
  sourceClass: typeof Glsl,
): Record<string, Generator> {
  const generatorMap: Record<string, Generator> = {};

  for (const transform of generatorTransforms) {
    generatorMap[transform.name] = createGenerator(transform, sourceClass);
  }

  return generatorMap;
}

export function addTransformChainMethod(
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

  // @ts-ignore
  cls.prototype[processedTransformDefinition.name] =
    addTransformApplicationToInternalChain;
}

interface ImplicitArg {
  type: string;
  name: string;
}

const typeLookup: Record<
  TransformDefinitionType,
  { returnType: string; args: readonly ImplicitArg[] }
> = {
  src: {
    returnType: 'vec4',
    args: [{ type: 'vec2', name: '_st' }],
  },
  coord: {
    returnType: 'vec2',
    args: [{ type: 'vec2', name: '_st' }],
  },
  color: {
    returnType: 'vec4',
    args: [{ type: 'vec4', name: '_c0' }],
  },
  combine: {
    returnType: 'vec4',
    args: [
      { type: 'vec4', name: '_c0' },
      { type: 'vec4', name: '_c1' },
    ],
  },
  combineCoord: {
    returnType: 'vec2',
    args: [
      { type: 'vec2', name: '_st' },
      { type: 'vec4', name: '_c0' },
    ],
  },
};

export function processGlsl(
  transformDefinition: TransformDefinition,
): ProcessedTransformDefinition {
  const { args, returnType } = typeLookup[transformDefinition.type];

  const allInputs = [...args, ...transformDefinition.inputs];

  const signature = allInputs
    .map((input) => `${input.type} ${input.name}`)
    .join(', ');

  const glslFunction = `
  ${returnType} ${transformDefinition.name}(${signature}) {
      ${transformDefinition.glsl}
  }
`;

  return {
    ...transformDefinition,
    // The first implicit argument is supplied by the compiler (the current
    // uv coordinate or color), so it is not part of the runtime inputs. For
    // combine/combineCoord the second implicit argument (`_c1`/`_c0`)
    // remains, and receives the user's first argument (the other source).
    inputs: allInputs.slice(1) as TransformDefinitionInput[],
    glsl: glslFunction,
    processed: true,
  };
}
