import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { Output } from './Output';

export interface TransformApplication {
  transform: ProcessedTransformDefinition;
  userArgs: unknown[];
}

export class Glsl {
  transforms: TransformApplication[];

  constructor(transformApplication: TransformApplication) {
    this.transforms = [transformApplication];
  }

  out(output: Output) {
    output.render(this.transforms);
  }
}
