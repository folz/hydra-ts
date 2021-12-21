import { TransformApplication } from '../GlslSource';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';
export interface TypedArg {
    value: TransformDefinitionInput['default'];
    type: TransformDefinitionInput['type'];
    isUniform: boolean;
    name: TransformDefinitionInput['name'];
    vecLen: number;
}
export declare function formatArguments(transformApplication: TransformApplication, startIndex: number): TypedArg[];
