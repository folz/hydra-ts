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
  readonly defaultOutput?: Output;

  constructor(
    transforms: ImmutableList<TransformApplication>,
    defaultOutput?: Output,
  ) {
    this.transforms = transforms;
    this.defaultOutput = defaultOutput;
  }

  out(output?: Output) {
    const target = output ?? this.defaultOutput;

    if (target === undefined) {
      throw new Error(
        '.out() was called without an output, and this chain has no default ' +
          'output. Pass an output (e.g. .out(o0)), or build the chain with ' +
          "a Hydra instance's bound generators (hydra.generators), which " +
          "default to that instance's first output.",
      );
    }

    target.render(this.transforms.toArray());
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
