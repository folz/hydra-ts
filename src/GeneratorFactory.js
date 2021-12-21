import { GlslSource } from './GlslSource';
import { typeLookup, } from './glsl/transformDefinitions.js';
export class GeneratorFactory {
    constructor({ changeListener, defaultUniforms, precision, transforms, }) {
        this.generators = {};
        this.glslTransforms = {};
        this.sourceClass = class extends GlslSource {
        };
        this.setFunction = (transformDefinition) => {
            const { name } = transformDefinition;
            const processedTransformDefinition = processGlsl(transformDefinition);
            this.glslTransforms[name] = processedTransformDefinition;
            const { precision } = this;
            if (processedTransformDefinition.type === 'src') {
                this.generators[name] = (...args) => new this.sourceClass({
                    defaultUniforms: this.defaultUniforms,
                    name,
                    precision,
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
export function processGlsl(obj) {
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
    return Object.assign(Object.assign({}, obj), { glsl: glslFunction, processed: true });
}
