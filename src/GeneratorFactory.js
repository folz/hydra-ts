import { GlslSource } from './GlslSource';
import { typeLookup, } from './glsl/transformDefinitions.js';
export class GeneratorFactory {
    constructor({ changeListener, defaultUniforms, precision, transforms, }) {
        this.generators = {};
        this.glslTransforms = {};
        this.sourceClass = createSourceClass();
        this.setFunction = (obj) => {
            const processedGlsl = processGlsl(obj);
            if (processedGlsl) {
                this._addMethod(obj.name, processedGlsl);
            }
        };
        this.changeListener = changeListener;
        this.defaultUniforms = defaultUniforms;
        this.precision = precision;
        transforms.map((transform) => this.setFunction(transform));
    }
    _addMethod(method, transform) {
        this.glslTransforms[method] = transform;
        const precision = this.precision;
        if (transform.type === 'src') {
            this.generators[method] = (...args) => new this.sourceClass({
                defaultUniforms: this.defaultUniforms,
                name: method,
                precision,
                transform: transform,
                userArgs: args,
            });
            this.changeListener({ synth: this, method });
        }
        else {
            this.sourceClass.createTransformOnPrototype(this.sourceClass, method, transform);
        }
    }
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
    // TODO: remove if determined unnecessary
    // add extra input to beginning for backward combatibility @todo update compiler so this is no longer necessary
    // if (obj.type === 'combine' || obj.type === 'combineCoord') {
    //   obj.inputs.unshift({
    //     name: 'color',
    //     type: 'vec4',
    //   });
    // }
    return Object.assign(Object.assign({}, obj), { glsl: glslFunction, processed: true });
}
function createSourceClass() {
    return class extends GlslSource {
    };
}
