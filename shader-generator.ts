import Generator from './src/generator-factory';
import Sandbox from './src/eval-sandbox';

const baseUniforms = ['s0', 's1', 's2', 's3', 'o0', 'o1', 'o2']; // names of uniforms usually used in hydra. These can be customized

export default class ShaderGenerator {
  generator: Generator;
  renderer: Record<string, any>;
  sandbox: Sandbox;
  initialCode: string;
  generatedCode: unknown;

  constructor({
    defaultUniforms = { time: 0, resolution: [1280, 720] },
    customUniforms = baseUniforms,
    extendTransforms = [],
  } = {}) {
    this.renderer = {};

    var self = this;

    this.generator = new Generator({
      defaultUniforms,
      extendTransforms,
      changeListener: ({ type, method, synth }) => {
        if (type === 'add') {
          self.renderer[method] = synth.generators[method];
        } else if (type === 'remove') {
          // pass
        }
      },
      // @ts-ignore
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

  eval(code: string) {
    this.sandbox.eval(`${this.initialCode}
          ${code}`);
    return this.generatedCode;
  }
}
