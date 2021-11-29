import { GlslSource } from '../GlslSource';
import { Output } from '../Output';
var GlslValueType;
(function (GlslValueType) {
    GlslValueType["UNKNOWN"] = "UNKNOWN";
    GlslValueType["DEFAULT"] = "DEFAULT";
    GlslValueType["Float"] = "Float";
})(GlslValueType || (GlslValueType = {}));
export var JsValueType;
(function (JsValueType) {
    JsValueType["UNKNOWN"] = "UNKNOWN";
    JsValueType["Undefined"] = "Undefined";
    JsValueType["Number"] = "Number";
    JsValueType["Function"] = "Function";
    JsValueType["Array"] = "Array";
    JsValueType["HydraSource"] = "HydraSource";
    JsValueType["HydraOutput"] = "HydraOutput";
})(JsValueType || (JsValueType = {}));
export function getJsValueType(value) {
    if (value === undefined) {
        return JsValueType.Undefined;
    }
    else if (typeof value === 'number') {
        return JsValueType.Number;
    }
    else if (Array.isArray(value)) {
        return JsValueType.Array;
    }
    else if (typeof value === 'function') {
        return JsValueType.Function;
    }
    else if (value instanceof GlslSource) {
        return JsValueType.HydraSource;
    }
    else if (value instanceof Output) {
        return JsValueType.HydraOutput;
    }
    else {
        return JsValueType.UNKNOWN;
    }
}
