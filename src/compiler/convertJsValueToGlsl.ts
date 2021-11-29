import { GlslSource } from '../GlslSource';
import { Output } from '../Output';

enum GlslValueType {
  UNKNOWN = 'UNKNOWN',
  DEFAULT = 'DEFAULT',
  Float = 'Float',
}

export enum JsValueType {
  UNKNOWN = 'UNKNOWN',
  Undefined = 'Undefined',
  Number = 'Number',
  Function = 'Function',
  Array = 'Array',
  HydraSource = 'HydraSource',
  HydraOutput = 'HydraOutput',
}

export function getJsValueType(value: any): keyof typeof JsValueType {
  if (value === undefined) {
    return JsValueType.Undefined;
  } else if (typeof value === 'number') {
    return JsValueType.Number;
  } else if (Array.isArray(value)) {
    return JsValueType.Array;
  } else if (typeof value === 'function') {
    return JsValueType.Function;
  } else if (value instanceof GlslSource) {
    return JsValueType.HydraSource;
  } else if (value instanceof Output) {
    return JsValueType.HydraOutput;
  } else {
    return JsValueType.UNKNOWN;
  }
}
