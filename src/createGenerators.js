import { Glsl } from './Glsl';
export function createGenerators({ transformDefinitions, }) {
    const sourceClass = class extends Glsl {
    };
    const ret = {};
    for (const transformDefinition of transformDefinitions) {
        const processedTransformDefinition = processGlsl(transformDefinition);
        const { name } = processedTransformDefinition;
        if (processedTransformDefinition.type === 'src') {
            ret[name] = (...args) => new sourceClass({
                transform: processedTransformDefinition,
                userArgs: args,
            });
        }
        else {
            createTransformOnPrototype(sourceClass, processedTransformDefinition);
        }
    }
    return ret;
}
export function createTransformOnPrototype(cls, processedTransformDefinition) {
    function addTransformApplicationToInternalChain(...args) {
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
const typeLookup = {
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
export function processGlsl(transformDefinition) {
    const { implicitFirstArg, returnType } = typeLookup[transformDefinition.type];
    const signature = [
        implicitFirstArg,
        ...transformDefinition.inputs.map((input) => `${input.type} ${input.name}`),
    ].join(', ');
    let glslFunction = `
  ${returnType} ${transformDefinition.name}(${signature}) {
      ${transformDefinition.glsl}
  }
`;
    return Object.assign(Object.assign({}, transformDefinition), { glsl: glslFunction, processed: true });
}
