import type { TransformDefinition } from './glsl/transformDefinitions.js';
import {
  ProcessedTransformDefinition,
  TransformDefinitionType,
} from './glsl/transformDefinitions.js';
import { Glsl } from './Glsl';

type GeneratorMap = Record<string, () => Glsl>;

export function createGenerators({
  transformDefinitions,
}: {
  transformDefinitions: TransformDefinition[];
}): GeneratorMap {
  const sourceClass = class extends Glsl {};
  const ret: GeneratorMap = {};

  for (const transformDefinition of transformDefinitions) {
    const processedTransformDefinition = processGlsl(transformDefinition);

    const { name } = processedTransformDefinition;

    if (processedTransformDefinition.type === 'src') {
      ret[name] = (...args: unknown[]) =>
        new sourceClass({
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
  cls: typeof Glsl,
  processedTransformDefinition: ProcessedTransformDefinition,
) {
  function addTransformApplicationToInternalChain(
    this: Glsl,
    ...args: unknown[]
  ): Glsl {
    this.transforms.push({
      transform: processedTransformDefinition,
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
