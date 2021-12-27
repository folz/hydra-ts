import { GlslSource } from './GlslSource';
export class GeneratorFactory {
    constructor({ changeListener, defaultUniforms, precision, transformDefinitions, }) {
        this.sourceClass = class extends GlslSource {
        };
        this.setFunction = (transformDefinition) => {
            const processedTransformDefinition = processGlsl(transformDefinition);
            const { name } = processedTransformDefinition;
            if (processedTransformDefinition.type === 'src') {
                const generator = (...args) => new this.sourceClass({
                    defaultUniforms: this.defaultUniforms,
                    precision: this.precision,
                    transform: processedTransformDefinition,
                    userArgs: args,
                });
                this.changeListener({ generator, name });
            }
            else {
                createTransformOnPrototype(this.sourceClass, processedTransformDefinition);
            }
        };
        this.changeListener = changeListener;
        this.defaultUniforms = defaultUniforms;
        this.precision = precision;
        for (const transformDefinition of transformDefinitions) {
            this.setFunction(transformDefinition);
        }
    }
}
export function createTransformOnPrototype(cls, processedTransformDefinition) {
    function addTransformApplicationToInternalChain(...args) {
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
    let { implicitFirstArg, returnType } = typeLookup[transformDefinition.type];
    let customArgs = transformDefinition.inputs
        .map((input) => `${input.type} ${input.name}`)
        .join(', ');
    let args = `${implicitFirstArg}${customArgs.length > 0 ? ', ' + customArgs : ''}`;
    let glslFunction = `
  ${returnType} ${transformDefinition.name}(${args}) {
      ${transformDefinition.glsl}
  }
`;
    return Object.assign(Object.assign({}, transformDefinition), { glsl: glslFunction, processed: true });
}
