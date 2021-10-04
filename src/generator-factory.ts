import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/glsl-functions.js';
import { GlslSource } from './glsl-source';
import type { Output } from './output';

interface GeneratorFactoryOptions {
  changeListener?: GeneratorFactory['changeListener'];
  defaultOutput: GeneratorFactory['defaultOutput'];
  defaultUniforms?: GeneratorFactory['defaultUniforms'];
  transforms: TransformDefinition[];
}

export class GeneratorFactory {
  changeListener: (options: any) => void;
  defaultOutput: Output;
  defaultUniforms: Uniforms;
  generators: Record<string, () => GlslSource> = {};
  glslTransforms: Record<string, TransformDefinition> = {};
  sourceClass: typeof GlslSource = createSourceClass();

  constructor({
    defaultUniforms = {},
    defaultOutput,
    changeListener = () => {},
    transforms,
  }: GeneratorFactoryOptions) {
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

  _addMethod(method: string, transform: TransformDefinition) {
    this.glslTransforms[method] = transform;

    if (transform.type === 'src') {
      this.generators[method] = (...args: any[]) =>
        new this.sourceClass({
          name: method,
          transform: transform,
          userArgs: args,
          defaultOutput: this.defaultOutput,
          defaultUniforms: this.defaultUniforms,
          synth: this,
        });
      this.changeListener({ type: 'add', synth: this, method });
    } else {
      // @ts-ignore
      this.sourceClass.prototype[method] = function (...args: any[]) {
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

  setFunction = (obj: TransformDefinition) => {
    const processedGlsl = processGlsl(obj);

    if (processedGlsl) {
      this._addMethod(obj.name, processedGlsl);
    }
  };
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

function processGlsl(obj: TransformDefinition): TransformDefinition | undefined {
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

  return {
    ...obj,
    glsl: glslFunction,
  };
}

function createSourceClass() {
  return class extends GlslSource {};
}
