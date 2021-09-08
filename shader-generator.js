"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_factory_1 = __importDefault(require("./src/generator-factory"));
const eval_sandbox_1 = __importDefault(require("./src/eval-sandbox"));
const baseUniforms = ['s0', 's1', 's2', 's3', 'o0', 'o1', 'o2']; // names of uniforms usually used in hydra. These can be customized
class ShaderGenerator {
    constructor({ defaultUniforms = { time: 0, resolution: [1280, 720] }, customUniforms = baseUniforms, extendTransforms = [], } = {}) {
        var self = this;
        self.renderer = {};
        var generatorOpts = { defaultUniforms, extendTransforms };
        generatorOpts.changeListener = ({ type, method, synth }) => {
            if (type === 'add') {
                self.renderer[method] = synth.generators[method];
            }
            else if (type === 'remove') {
                // pass
            }
        };
        generatorOpts.defaultOutput = {
            render: (pass) => (self.generatedCode = pass[0]),
        };
        this.generator = new generator_factory_1.default(generatorOpts);
        this.sandbox = new eval_sandbox_1.default(this.renderer, false);
        this.initialCode = `
      ${customUniforms.map((name) => `const ${name} = () => {}`).join(';')}
    `;
        console.log(this.initialCode);
    }
    eval(code) {
        this.sandbox.eval(`${this.initialCode}
          ${code}`);
        return this.generatedCode;
    }
}
exports.default = ShaderGenerator;
