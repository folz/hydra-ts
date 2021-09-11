import Generator from './src/generator-factory';
import Sandbox from './src/eval-sandbox';
const baseUniforms = ['s0', 's1', 's2', 's3', 'o0', 'o1', 'o2']; // names of uniforms usually used in hydra. These can be customized
export default class ShaderGenerator {
    constructor({ defaultUniforms = { time: 0, resolution: [1280, 720] }, customUniforms = baseUniforms, extendTransforms = [], } = {}) {
        var self = this;
        self.renderer = {};
        this.generator = new Generator({
            defaultUniforms,
            extendTransforms,
            changeListener: ({ type, method, synth }) => {
                if (type === 'add') {
                    self.renderer[method] = synth.generators[method];
                }
                else if (type === 'remove') {
                    // pass
                }
            },
            defaultOutput: {
                render: (pass) => (self.generatedCode = pass[0]),
            },
        });
        this.sandbox = new Sandbox(this.renderer, false);
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
