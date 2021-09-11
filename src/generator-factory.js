"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glsl_functions_js_1 = __importDefault(require("./glsl/glsl-functions.js"));
const glsl_source_1 = __importDefault(require("./glsl-source"));
class GeneratorFactory {
    constructor({ defaultUniforms, defaultOutput, extendTransforms = [], changeListener = () => { }, } = {}) {
        this.generators = {};
        this.glslTransforms = {};
        this.sourceClass = createSourceClass();
        this.defaultOutput = defaultOutput;
        this.defaultUniforms = defaultUniforms;
        this.changeListener = changeListener;
        this.extendTransforms = extendTransforms;
        this.generators = Object.entries(this.generators).reduce((prev, [method]) => {
            this.changeListener({ type: 'remove', synth: this, method });
            return prev;
        }, {});
        this.sourceClass = createSourceClass();
        let functions = glsl_functions_js_1.default;
        // add user definied transforms
        if (Array.isArray(this.extendTransforms)) {
            functions.concat(this.extendTransforms);
        }
        else if (typeof this.extendTransforms === 'object' && this.extendTransforms.type) {
            functions.push(this.extendTransforms);
        }
        return functions.map((transform) => this.setFunction(transform));
    }
    _addMethod(method, transform) {
        this.glslTransforms[method] = transform;
        if (transform.type === 'src') {
            const func = (...args) => new this.sourceClass({
                name: method,
                transform: transform,
                userArgs: args,
                defaultOutput: this.defaultOutput,
                defaultUniforms: this.defaultUniforms,
                synth: this,
            });
            this.generators[method] = func;
            this.changeListener({ type: 'add', synth: this, method });
            return func;
        }
        else {
            this.sourceClass.prototype[method] = function (...args) {
                this.transforms.push({ name: method, transform: transform, userArgs: args });
                return this;
            };
        }
        return undefined;
    }
    setFunction(obj) {
        var processedGlsl = processGlsl(obj);
        if (processedGlsl)
            this._addMethod(obj.name, processedGlsl);
    }
}
exports.default = GeneratorFactory;
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
};
// expects glsl of format
// {
//   name: 'osc', // name that will be used to access function as well as within glsl
//   type: 'src', // can be src: vec4(vec2 _st), coord: vec2(vec2 _st), color: vec4(vec4 _c0), combine: vec4(vec4 _c0, vec4 _c1), combineCoord: vec2(vec2 _st, vec4 _c0)
//   inputs: [
//     {
//       name: 'freq',
//       type: 'float', // 'float'   //, 'texture', 'vec4'
//       default: 0.2
//     },
//     {
//           name: 'sync',
//           type: 'float',
//           default: 0.1
//         },
//         {
//           name: 'offset',
//           type: 'float',
//           default: 0.0
//         }
//   ],
//  glsl: `
//    vec2 st = _st;
//    float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
//    float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
//    float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
//    return vec4(r, g, b, 1.0);
// `
// }
// // generates glsl function:
// `vec4 osc(vec2 _st, float freq, float sync, float offset){
//  vec2 st = _st;
//  float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
//  float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
//  float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
//  return vec4(r, g, b, 1.0);
// }`
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
    return class extends glsl_source_1.default {
    };
}
