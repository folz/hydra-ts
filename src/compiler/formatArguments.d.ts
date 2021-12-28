import { TransformApplication } from '../Glsl';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';
export interface TypedArg {
    value: TransformDefinitionInput['default'];
    type: TransformDefinitionInput['type'];
    isUniform: boolean;
    name: TransformDefinitionInput['name'];
    vecLen: number;
}
export declare function formatArguments(transformApplication: TransformApplication, startIndex: number): TypedArg[];
export declare function ensureDecimalDot(val: any): string;
export declare function fillArrayWithDefaults(arr: any[], len: number): any[];
