import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { Output } from './Output';
import { Precision } from './HydraRenderer';
import { compileTransformApplicationsWithContext } from './compiler/compileTransformApplicationsWithContext';

export interface TransformApplication {
  defaultUniforms?: GlslSource['defaultUniforms'];
  precision: Precision;
  transform: ProcessedTransformDefinition;
  userArgs: unknown[];
}

export type CompiledTransform = {
  frag: string;
  uniforms: {
    [name: string]:
      | string
      | Uniform
      | ((context: any, props: any) => number | number[])
      | Texture2D
      | undefined;
  };
};

export class GlslSource {
  defaultUniforms?: {
    [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
  };
  precision: Precision;
  transforms: TransformApplication[] = [];

  constructor(transformApplication: TransformApplication) {
    this.defaultUniforms = transformApplication.defaultUniforms;
    this.precision = transformApplication.precision;
    this.transforms.push(transformApplication);
  }

  do(...transforms: TransformApplication[]) {
    this.transforms.push(...transforms);
    return this;
  }

  skip(...transforms: TransformApplication[]) {
    return this;
  }

  out(output: Output) {
    const glsl = this.glsl();

    try {
      output.render(glsl);
    } catch (error) {
      console.log('shader could not compile', error);
    }
  }

  glsl(): CompiledTransform[] {
    if (this.transforms.length > 0) {
      const context = {
        defaultUniforms: this.defaultUniforms,
        precision: this.precision,
      };

      return [
        compileTransformApplicationsWithContext(this.transforms, context),
      ];
    }

    return [];
  }
}
