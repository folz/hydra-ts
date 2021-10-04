import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/glsl-functions.js';
import { GlslSource } from './glsl-source';
import type { Output } from './output';
import { typeLookup } from './glsl/glsl-functions.js';

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

    transforms.map((transform) => this.setFunction(transform));
  }

  _addMethod(method: string, transform: TransformDefinition) {
    this.glslTransforms[method] = transform;

    // TODO: Pass in precision directly; don't infer from defaultOutput
    const precision = this.defaultOutput.precision;
    if (transform.type === 'src') {
      this.generators[method] = (...args: any[]) =>
        new this.sourceClass({
          defaultUniforms: this.defaultUniforms,
          name: method,
          precision,
          transform: transform,
          userArgs: args,
        });
      this.changeListener({ type: 'add', synth: this, method });
    } else {
      // Must be kept as function() because it relies on `this` rebinding
      // @ts-ignore
      this.sourceClass.prototype[method] = function (...args: any[]) {
        this.transforms.push({
          name: method,
          precision,
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

export function processGlsl(obj: TransformDefinition): TransformDefinition {
  let t = typeLookup[obj.type];

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
