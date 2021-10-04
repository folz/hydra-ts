import { GlslSource } from './glsl-source';
export class GeneratorFactory {
    constructor({ defaultUniforms = {}, defaultOutput, changeListener = () => { }, transforms, }) {
        this.generators = {};
        this.glslTransforms = {};
        this.sourceClass = createSourceClass();
        this.setFunction = (obj) => {
            const processedGlsl = processGlsl(obj);
            if (processedGlsl) {
                this._addMethod(obj.name, processedGlsl);
            }
        };
        this.defaultOutput = defaultOutput;
        this.defaultUniforms = defaultUniforms;
        this.changeListener = changeListener;
        this.generators = Object.entries(this.generators).reduce((prev, [method]) => {
            this.changeListener({ type: 'remove', synth: this, method });
            return prev;
        }, {});
        this.sourceClass = createSourceClass();
        transforms.map((transform) => this.setFunction(transform));
    }
    _addMethod(method, transform) {
        this.glslTransforms[method] = transform;
        if (transform.type === 'src') {
            this.generators[method] = (...args) => new this.sourceClass({
                name: method,
                transform: transform,
                userArgs: args,
                defaultOutput: this.defaultOutput,
                defaultUniforms: this.defaultUniforms,
                synth: this,
            });
            this.changeListener({ type: 'add', synth: this, method });
        }
        else {
            // @ts-ignore
            this.sourceClass.prototype[method] = function (...args) {
                this.transforms.push({
                    defaultOutput: this.defaultOutput,
                    name: method,
                    transform: transform,
                    userArgs: args,
                });
                return this;
            };
        }
    }
}
const typeLookup = {
    src: {
        returnType: 'vec4',
        args: ['vec2 _st'],
    },
    coord: {
        returnType: 'vec2',
        args: ['vec2 _st'],
    },
    color: {
        returnType: 'vec4',
        args: ['vec4 _c0'],
    },
    combine: {
        returnType: 'vec4',
        args: ['vec4 _c0', 'vec4 _c1'],
    },
    combineCoord: {
        returnType: 'vec2',
        args: ['vec2 _st', 'vec4 _c0'],
    },
    renderpass: undefined,
};
function processGlsl(obj) {
    let t = typeLookup[obj.type];
    if (!t) {
        console.warn(`type ${obj.type} not recognized`, obj);
        return undefined;
    }
    let baseArgs = t.args.map((arg) => arg).join(', ');
    // @todo: make sure this works for all input types, add validation
    let customArgs = obj.inputs.map((input) => `${input.type} ${input.name}`).join(', ');
    let args = `${baseArgs}${customArgs.length > 0 ? ', ' + customArgs : ''}`;
    let glslFunction = `
  ${t.returnType} ${obj.name}(${args}) {
      ${obj.glsl}
  }
`;
    // add extra input to beginning for backward combatibility @todo update compiler so this is no longer necessary
    if (obj.type === 'combine' || obj.type === 'combineCoord')
        obj.inputs.unshift({
            name: 'color',
            type: 'vec4',
        });
    return Object.assign(Object.assign({}, obj), { glsl: glslFunction });
}
function createSourceClass() {
    return class extends GlslSource {
    };
}
