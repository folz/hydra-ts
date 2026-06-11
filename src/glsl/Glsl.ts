import { Output } from '../Output.js';
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
}
