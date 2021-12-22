import { GlslSource } from './GlslSource';
import { typeLookup, } from './glsl/transformDefinitions.js';
export class GeneratorFactory {
    constructor({ changeListener, defaultUniforms, precision, transforms, }) {
        this.generators = {};
        this.glslTransforms = {};
        this.sourceClass = class extends GlslSource {
        };
        this.setFunction = (transformDefinition) => {
            const processedTransformDefinition = processGlsl(transformDefinition);
            const { name } = processedTransformDefinition;
            this.glslTransforms[name] = processedTransformDefinition;
            if (processedTransformDefinition.type === 'src') {
                this.generators[name] = (...args) => new this.sourceClass({
                    defaultUniforms: this.defaultUniforms,
                    precision: this.precision,
                    transform: processedTransformDefinition,
                    userArgs: args,
                });
                this.changeListener({ synth: this, method: name });
            }
            else {
                createTransformOnPrototype(this.sourceClass, processedTransformDefinition);
            }
        };
        this.changeListener = changeListener;
        this.defaultUniforms = defaultUniforms;
        this.precision = precision;
        for (const transform of transforms) {
            this.setFunction(transform);
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
export function processGlsl(transformDefinition) {
    let t = typeLookup[transformDefinition.type];
    let baseArgs = t.args.map((arg) => arg).join(', ');
    // @todo: make sure this works for all input types, add validation
    let customArgs = transformDefinition.inputs
        .map((input) => `${input.type} ${input.name}`)
        .join(', ');
    let args = `${baseArgs}${customArgs.length > 0 ? ', ' + customArgs : ''}`;
    let glslFunction = `
  ${t.returnType} ${transformDefinition.name}(${args}) {
      ${transformDefinition.glsl}
  }
`;
    // add extra input to beginning for backward compatibility
    if (transformDefinition.type === 'combine' ||
        transformDefinition.type === 'combineCoord') {
        // @ts-ignore
        transformDefinition.inputs.unshift({
            name: 'color',
            type: 'vec4',
        });
    }
    return Object.assign(Object.assign({}, transformDefinition), { glsl: glslFunction, processed: true });
}
