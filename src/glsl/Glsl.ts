import { Output } from '../Output.js';
import { GlEnvironment } from '../Hydra.js';
import {
  CompiledTransform,
  compileWithEnvironment,
} from '../compiler/compileWithEnvironment.js';
import ImmutableList from './ImmutableList.js';
import { ProcessedTransformDefinition } from './transformDefinitions.js';

export interface TransformApplication {
  transform: ProcessedTransformDefinition;
  userArgs: unknown[];
}

export class Glsl {
  transforms: ImmutableList<TransformApplication>;

  constructor(transforms: ImmutableList<TransformApplication>) {
    this.transforms = transforms;
  }

  out(output: Output) {
    output.render(this.transforms.toArray());
  }

  /**
   * Compiles the chain without rendering it, returning the passes
   * ({ frag, uniforms }) like hydra-synth's GlslSource.glsl(). Unlike
   * upstream, the environment (precision and default uniforms) is an
   * explicit argument rather than carried implicitly by the chain.
   */
  glsl(environment: GlEnvironment): CompiledTransform[] {
    return [compileWithEnvironment(this.transforms.toArray(), environment)];
  }
}
