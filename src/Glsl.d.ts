import { ProcessedTransformDefinition } from './glsl/transformDefinitions';
import { Output } from './Output';
export interface TransformApplication {
    transform: ProcessedTransformDefinition;
    userArgs: unknown[];
}
export declare class Glsl {
    transforms: TransformApplication[];
    constructor(transformApplication: TransformApplication);
    out(output: Output): void;
}
