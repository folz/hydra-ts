export declare enum JsValueType {
    UNKNOWN = "UNKNOWN",
    Undefined = "Undefined",
    Number = "Number",
    Function = "Function",
    Array = "Array",
    HydraSource = "HydraSource",
    HydraOutput = "HydraOutput"
}
export declare function getJsValueType(value: any): keyof typeof JsValueType;
