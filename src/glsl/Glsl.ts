import { Output } from '../Output';
import ImmutableList from './ImmutableList';
import { ProcessedTransformDefinition } from './transformDefinitions';

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
