import type { Uniforms } from 'regl';
import type { TransformDefinition } from './glsl/transformDefinitions.js';
import { GlslSource } from './GlslSource';
import { ProcessedTransformDefinition, typeLookup } from './glsl/transformDefinitions.js';
import { Precision } from '../HydraRenderer';

interface GeneratorFactoryOptions {
  changeListener: GeneratorFactory['changeListener'];
  defaultUniforms: GeneratorFactory['defaultUniforms'];
  precision: Precision;
  transforms: TransformDefinition[];
}

export class GeneratorFactory {
  changeListener: (options: any) => void;
  defaultUniforms: Uniforms;
  generators: Record<string, () => GlslSource> = {};
  glslTransforms: Record<string, ProcessedTransformDefinition> = {};
  precision: Precision;
  sourceClass: typeof GlslSource = createSourceClass();

  constructor({ changeListener, defaultUniforms, precision, transforms }: GeneratorFactoryOptions) {
    this.changeListener = changeListener;
    this.defaultUniforms = defaultUniforms;
    this.precision = precision;

    transforms.map((transform) => this.setFunction(transform));
  }

  _addMethod(method: string, transform: ProcessedTransformDefinition) {
    this.glslTransforms[method] = transform;

    const precision = this.precision;
    if (transform.type === 'src') {
      this.generators[method] = (...args: any[]) =>
        new this.sourceClass({
          defaultUniforms: this.defaultUniforms,
          name: method,
          precision,
          transform: transform,
          userArgs: args,
        });
      this.changeListener({ synth: this, method });
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

export function processGlsl(obj: TransformDefinition): ProcessedTransformDefinition {
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
    processed: true,
  };
}

function createSourceClass() {
  return class extends GlslSource {};
}
